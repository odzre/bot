import fs from 'fs'
import archiver from 'archiver'

export default {
    cmd: ['backup', 'backupdb'],
    category: 'owner',
    run: async (m, { sock }) => {
        if (!m.isOwner) return m.reply('Khusus Owner.')

        m.reply('⏳ _Sedang membuat backup seluruh file..._')

        const output = fs.createWriteStream('backup.zip')
        const archive = archiver('zip', { zlib: { level: 9 } })

        output.on('close', async () => {
            const stats = fs.statSync('backup.zip')
            const fileSizeInBytes = stats.size
            const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)

            let caption = `✅ *FULL BACKUP SUKSES*\n\n`
            caption += `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`
            caption += `⏰ Jam: ${new Date().toLocaleTimeString('id-ID')}\n`
            caption += `📦 Ukuran: ${fileSizeInMegabytes.toFixed(2)} MB\n\n`
            caption += `_File backup mencakup semua folder project (Kecuali node_modules & cache)_`

            await sock.sendMessage(m.from, { 
                document: fs.readFileSync('backup.zip'), 
                mimetype: 'application/zip',
                fileName: `FullBackup-${Date.now()}.zip`,
                caption: caption
            }, { quoted: m })

            fs.unlinkSync('backup.zip')
        })

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.log(err)
            } else {
                throw err
            }
        })

        archive.on('error', (err) => {
            m.reply('❌ Error: ' + err)
        })

        archive.pipe(output)

        archive.glob('**/*', {
            cwd: process.cwd(),
            ignore: [
                'node_modules/**',
                'package-lock.json',
                '.npm/**',
                'cache/**',
                'tmp/**',
                'backup.zip',
                '.git/**'
            ]
        })

        archive.finalize()
    }
}