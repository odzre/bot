import fs from 'fs'
import path from 'path'

export default {
    cmd: ['addplugin', 'delplugin', 'getplugin', 'listplugin'],
    category: 'owner',
    run: async (m, { text, command }) => {
        if (!m.isOwner) return m.adReply('Khusus Owner.')

        if (command === 'addplugin') {
            if (!m.quoted) return m.adReply('Balas/Reply pesan script kodenya.')
            if (!text) return m.adReply('Masukan nama file.\nContoh: .addplugin fiturbaru')

            let filename = text.trim()
            
            // Otomatis tambah .js jika belum ada
            if (!filename.endsWith('.js')) filename += '.js'
            
            // Otomatis tambah _ di depan jika belum ada
            if (!filename.startsWith('_')) filename = '_' + filename

            const filePath = path.join('./plugins', filename)
            
            try {
                fs.writeFileSync(filePath, m.quoted.text)
                return m.adReply(`✅ Plugin *${filename}* berhasil disimpan!`)
            } catch (e) {
                return m.adReply(`❌ Gagal menyimpan plugin: ${e.message}`)
            }
        }

        if (command === 'delplugin') {
            if (!text) return m.adReply('Masukan nama file.\nContoh: .delplugin fiturbaru')

            let filename = text.trim()
            if (!filename.endsWith('.js')) filename += '.js'
            if (!filename.startsWith('_')) filename = '_' + filename
            
            const filePath = path.join('./plugins', filename)

            if (!fs.existsSync(filePath)) return m.adReply(`❌ File *${filename}* tidak ditemukan.`)

            try {
                fs.unlinkSync(filePath)
                return m.adReply(`✅ Plugin *${filename}* berhasil dihapus!`)
            } catch (e) {
                return m.adReply(`❌ Gagal menghapus plugin: ${e.message}`)
            }
        }

        if (command === 'getplugin') {
            if (!text) return m.adReply('Masukan nama file.\nContoh: .getplugin fiturbaru')

            let filename = text.trim()
            if (!filename.endsWith('.js')) filename += '.js'
            if (!filename.startsWith('_')) filename = '_' + filename

            const filePath = path.join('./plugins', filename)

            if (!fs.existsSync(filePath)) return m.adReply(`❌ File *${filename}* tidak ditemukan.`)

            try {
                const content = fs.readFileSync(filePath, 'utf8')
                return m.adReply(content)
            } catch (e) {
                return m.adReply(`❌ Gagal mengambil plugin: ${e.message}`)
            }
        }

        if (command === 'listplugin') {
            try {
                const files = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'))
                let msg = `📂 *LIST PLUGIN* (${files.length})\n\n`
                files.forEach((f, i) => {
                    msg += `${i + 1}. ${f}\n`
                })
                return m.adReply(msg)
            } catch (e) {
                return m.adReply(`❌ Gagal membaca folder plugins.`)
            }
        }
    }
}