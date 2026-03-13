import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { groupCache } from '../lib/helper.js'

export default {
    cmd: ['hidetag', 'ht', 'h'],
    category: 'group',
    run: async (m, { sock, text }) => {
        if (!m.isGroup) return m.reply('Fitur ini hanya dapat digunakan di dalam grup.')
        if (!m.isAdmin && !m.isOwner) return m.reply('Hanya admin grup yang bisa menggunakan perintah ini.')

        const meta = groupCache.get(m.from) || await sock.groupMetadata(m.from)
        if (!meta) return m.reply('Gagal mengambil data grup, coba lagi nanti.')
        
        const participants = meta.participants.map(p => p.id)

        const isImage = m.type === 'imageMessage' || m.quoted?.type === 'imageMessage'
        const contentText = text || m.quoted?.text || ''

        if (isImage) {
            try {
                const targetMsg = (m.type === 'imageMessage') ? m.msg : m.quoted.msg
                const stream = await downloadContentFromMessage(targetMsg, 'image')
                let buffer = Buffer.from([])
                for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }

                return sock.sendMessage(m.from, {
                    image: buffer,
                    caption: contentText,
                    mentions: participants
                })
            } catch (e) {
                return m.reply('Gagal memproses gambar untuk hidetag.')
            }
        } else {
            if (!contentText) return m.reply('Silakan masukkan teks atau reply pesan/gambar yang ingin di-hidetag.\n\n*Contoh:* .ht Pengumuman penting!')
            
            return sock.sendMessage(m.from, {
                text: contentText,
                mentions: participants
            })
        }
    }
}
