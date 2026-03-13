import { getProsesSettings, saveProses, prosesDb } from '../lib/database.js'

export default {
    cmd: ['proses', 'done', 'setproses', 'setdone', 'listproses'],
    category: 'group',
    run: async (m, { sock, text, command, args }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya untuk grup.')
        if (!m.isAdmin) return m.adReply('kamu bukan admin.')

        const settings = getProsesSettings(m.from)
        const now = new Date()

        if (command === 'setproses') {
            if (!text || text === '-h') return m.adReply('*tutorial setproses*\n\n@id : id proses\n@user : tag pembeli\n@admin : tag admin\n@jam : waktu\n@tanggal : tanggal\n@pesan : detail pesanan\n\ncontoh: .setproses #@id @user sedang di proses admin @admin')
            settings.proses = text
            saveProses()
            return m.adReply('pesan **proses** berhasil diperbarui.')
        }

        if (command === 'setdone') {
            if (!text || text === '-h') return m.adReply('*tutorial setdone*\n\n@id : id proses\n@user : tag pembeli\n@admin : tag admin\n@jam : waktu\n@tanggal : tanggal\n\ncontoh: .setdone #@id @user selesai @admin')
            settings.done = text
            saveProses()
            return m.adReply('pesan **done** berhasil diperbarui.')
        }

        if (command === 'proses') {
            let body = m.quoted ? m.quoted.body : text
            if (!body) return m.adReply('masukan detail pesanan atau reply pesanan.')

            let id = Math.random().toString(36).substring(2, 6).toUpperCase()
            let buyer = m.quoted ? m.quoted.sender : m.sender
            
            prosesDb.active[id] = { 
                buyer, 
                admin: m.sender, 
                pesan: body, 
                jid: m.from,
                time: now.toLocaleString('id-ID')
            }
            saveProses()

            let msg = settings.proses
                .replace(/@id/g, id)
                .replace(/@user/g, `@${buyer.split('@')[0]}`)
                .replace(/@admin/g, `@${m.sender.split('@')[0]}`)
                .replace(/@jam/g, now.toLocaleTimeString('id-ID'))
                .replace(/@tanggal/g, now.toLocaleDateString('id-ID'))
                .replace(/@pesan/g, body)

            return m.adReply(msg, { mentions: [buyer, m.sender] })
        }

        if (command === 'done') {
            let id = args[0] ? args[0].toUpperCase() : null
            let data = id ? prosesDb.active[id] : null

            if (!data && m.quoted) {
                let findId = Object.keys(prosesDb.active).find(k => 
                    prosesDb.active[k].buyer === m.quoted.sender && 
                    prosesDb.active[k].jid === m.from
                )
                if (findId) {
                    id = findId
                    data = prosesDb.active[id]
                }
            }

            if (!id) return m.adReply('masukan ID proses atau reply chat buyer. ketik *.listproses* untuk cek ID.')
            if (!data) return m.adReply(`maaf, ID proses *${id}* tidak ditemukan atau sudah diselesaikan sebelumnya.`)

            let msg = settings.done
                .replace(/@id/g, id)
                .replace(/@user/g, `@${data.buyer.split('@')[0]}`)
                .replace(/@admin/g, `@${m.sender.split('@')[0]}`)
                .replace(/@jam/g, now.toLocaleTimeString('id-ID'))
                .replace(/@tanggal/g, now.toLocaleDateString('id-ID'))

            delete prosesDb.active[id]
            saveProses()

            return m.adReply(msg, { mentions: [data.buyer, m.sender] })
        }

        if (command === 'listproses') {
            let activeKeys = Object.keys(prosesDb.active).filter(k => prosesDb.active[k].jid === m.from)
            
            if (activeKeys.length === 0) return m.adReply('tidak ada pesanan yang sedang diproses di grup ini.')

            let txt = `*DAFTAR PROSES AKTIF*\n\n`
            let mentions = []
            activeKeys.forEach((id, i) => {
                let item = prosesDb.active[id]
                txt += `${i + 1}. *ID:* ${id}\n`
                txt += `   *Pesanan:* ${item.pesan}\n`
                txt += `   *Buyer:* @${item.buyer.split('@')[0]}\n`
                txt += `   *Waktu:* ${item.time}\n\n`
                mentions.push(item.buyer)
            })
            txt += `Gunakan *.done [ID]* untuk menyelesaikan.`
            
            return m.adReply(txt, { mentions })
        }
    }
}