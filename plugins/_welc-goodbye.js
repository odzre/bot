import { updateGroupSettings, getGroupSettings } from '../lib/database.js'

export default {
    cmd: ['welcome', 'goodbye', 'setwelcome', 'setgoodbye'],
    category: 'admin',
    run: async (m, { sock, text, args, command }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya dapat digunakan di dalam grup.')
        if (!m.isAdmin) return m.adReply('hanya admin yang bisa menggunakan perintah ini.')

        const settings = getGroupSettings(m.from)

        if (command === 'welcome') {
            if (args[0] === 'on') {
                updateGroupSettings(m.from, { welcome: true })
                return m.adReply('fitur **welcome** berhasil diaktifkan.')
            } else if (args[0] === 'off') {
                updateGroupSettings(m.from, { welcome: false })
                return m.adReply('fitur **welcome** berhasil dimatikan.')
            } else {
                return m.adReply(`*status welcome:* ${settings.welcome ? 'ON' : 'OFF'}\n\ngunakan: .welcome on/off\nketik .setwelcome -h untuk cara setting pesan.`)
            }
        }

        if (command === 'goodbye') {
            if (args[0] === 'on') {
                updateGroupSettings(m.from, { left: true })
                return m.adReply('fitur **goodbye** berhasil diaktifkan.')
            } else if (args[0] === 'off') {
                updateGroupSettings(m.from, { left: false })
                return m.adReply('fitur **goodbye** berhasil dimatikan.')
            } else {
                return m.adReply(`*status goodbye:* ${settings.left ? 'ON' : 'OFF'}\n\ngunakan: .goodbye on/off\nketik .setgoodbye -h untuk cara setting pesan.`)
            }
        }

        if (command === 'setwelcome') {
            if (!text || text === '-h') {
                return m.adReply(`*tutorial set welcome*
                
atur pesan sambutan member baru.

*variabel tersedia:*
• *@pushname* : tag member baru
• *@nama* : nama member (tanpa tag)
• *@gcname* : nama grup
• *@jam* : waktu masuk
• *@tanggal* : tanggal masuk
• *@picture=auto* : foto profil otomatis
• *@picture=URL* : link foto kustom

*contoh:*
.setwelcome halo @pushname, selamat datang di @gcname. @picture=auto`)
            }
            updateGroupSettings(m.from, { welcomeMsg: text })
            return m.adReply('pesan **welcome** berhasil diperbarui.')
        }

        if (command === 'setgoodbye') {
            if (!text || text === '-h') {
                return m.adReply(`*tutorial set goodbye*
                
atur pesan perpisahan member keluar.

*variabel tersedia:* (sama dengan setwelcome)

*contoh:*
.setgoodbye selamat tinggal @nama dari @gcname @picture=auto`)
            }
            updateGroupSettings(m.from, { leftMsg: text })
            return m.adReply('pesan **goodbye** berhasil diperbarui.')
        }
    }
}