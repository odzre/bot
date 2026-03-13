import { getUser, saveUsers } from '../lib/database.js'

export default {
    cmd: ['addsaldo', 'minsaldo', '+', '-'],
    category: 'owner',
    run: async (m, { text, args, command }) => {
        if (!m.isOwner) return m.adReply('Khusus Owner.')

        let target, nominalInput

        if (m.quoted) {
            target = m.quoted.sender
            nominalInput = args[0]
        } else {
            target = args[0]
            nominalInput = args[1]
        }

        if (!target || !nominalInput) {
            return m.adReply(`❌ *Format Salah*\n\nTag User:\n.addsaldo 628xx 10000\n+ 628xx 10000\n\nReply User:\n.addsaldo 10000\n+ 10000`)
        }

        target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        const user = getUser(target)
        
        if (!user) return m.adReply('User belum terdaftar di database.')

        const nominal = parseInt(nominalInput.replace(/[^0-9]/g, ''))
        if (isNaN(nominal)) return m.adReply('Nominal harus berupa angka.')

        const lastSaldo = user.saldo

        if (command === 'addsaldo' || command === '+') {
            user.saldo += nominal
        } else {
            user.saldo -= nominal
            if (user.saldo < 0) user.saldo = 0
        }

        saveUsers()

        const now = new Date()
        const dateOpt = { day: '2-digit', month: '2-digit', year: '2-digit' }
        const timeOpt = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
        const dateStr = now.toLocaleDateString('id-ID', dateOpt)
        const timeStr = now.toLocaleTimeString('id-ID', timeOpt).replace(/:/g, '.')

        const msg = `───〔 *Update Saldo* 〕──

*Nomor :* @${target.split('@')[0]}
*Saldo Terakhir :* Rp. ${lastSaldo.toLocaleString('id-ID')}
*Saldo Sekarang :* Rp. ${user.saldo.toLocaleString('id-ID')}
*Waktu :* ${dateStr}, ${timeStr} WIB`

        return m.adReply(msg, { mentions: [target] })
    }
}