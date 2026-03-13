import fs from 'fs'
import path from 'path'

const API_URL = 'https://bot.noetopup.com/api-github.php'

export default {
    cmd: ['cekupdate', 'updatesc'],
    category: 'owner',
    run: async (m, { sock, command }) => {
        if (!m.isOwner) return m.adReply('Perintah ini hanya dapat digunakan oleh Owner bot.')

        if (command === 'cekupdate') {
            try {
                const res = await fetch(`${API_URL}?action=check`)
                const json = await res.json()

                if (json.status === 'update_available') {
                    let txt = `PEMBARUAN TERSEDIA!\n\n`
                    txt += `Status: ${json.message}\n\n`
                    txt += `Daftar File yang Berubah:\n`
                    if (json.files_changed && json.files_changed.length > 0) {
                        json.files_changed.forEach(f => {
                            txt += `- ${f.filename} (${f.status})\n`
                        })
                    }
                    txt += `\nKetik .updatesc untuk mengunduh dan memasang pembaruan ini.`
                    return m.adReply(txt)
                } else {
                    return m.adReply(`Info API: ${json.message || 'Tidak ada info dari server.'}`)
                }
            } catch (e) {
                console.log('ERROR FETCH CEK UPDATE:', e)
                return m.adReply('Gagal terhubung dengan website API perantara. Cek log terminal (Pastikan Anda sudah mengunggah api-github.php ke website).')
            }
        }

        if (command === 'updatesc') {
            try {
                const res = await fetch(`${API_URL}?action=download`)
                const json = await res.json()

                if (json.status === 'success') {
                    let txt = `MEMPROSES PEMBARUAN\n\n`
                    txt += `File updated :\n`

                    for (const file of json.files) {
                        const filePath = path.resolve('./', file.filename)
                        const fileDir = path.dirname(filePath)

                        if (!fs.existsSync(fileDir)) {
                            fs.mkdirSync(fileDir, { recursive: true })
                        }

                        const buffer = Buffer.from(file.content, 'base64')
                        fs.writeFileSync(filePath, buffer)

                        txt += `- ${file.filename} (${file.status})\n`
                    }

                    txt += `\nBOT AKAN DI RESTART DALAM 3 DETIK`

                    await m.adReply(txt)

                    setTimeout(() => {
                        process.exit(1)
                    }, 3000)

                    return
                } else {
                    console.log('RESPON API SALAH (UPDATE SC):', json)
                    return m.adReply(`Gagal mengunduh file: ${json.message || 'Error tidak diketahui'}`)
                }
            } catch (e) {
                console.log('ERROR FETCH UPDATE SC:', e)
                return m.adReply('Terjadi kesalahan saat proses mengunduh file pembaruan. Cek log terminal server bot Anda.')
            }
        }
    }
}