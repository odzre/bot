import { getUser, transaksiDb } from '../lib/database.js'

export default {
    cmd: ['me', 'saldo', 'profile'],
    category: 'user',
    run: async (m, { sock, config }) => {
        const user = getUser(m.sender)
        if (!user) return m.reply('Data user tidak ditemukan.')

        const totalTrx = transaksiDb.filter(t => t.buyer_jid === m.sender && t.status === 'Sukses').length
        const totalDepo = 0 

        const jid = m.sender.split('@')[0]
        const lid = m.senderLid ? m.senderLid.split('@')[0] : '-'
        const saldo = user.saldo.toLocaleString('id-ID')
        const role = user.role ? user.role.toUpperCase() : 'SILVER'

        let msg = `─────〔 *PROFILE* 〕─────\n`
        msg += `› *User :* @${jid}\n`
        msg += `› *Jid :* ${jid}\n`
        msg += `› *Lid :* ${lid}\n`
        msg += `› *Balance :* Rp${saldo}\n`
        msg += `› *Role :* ${role}\n\n`
        
        msg += `> *Deposit :* ${totalDepo}\n`
        msg += `> *Transaksi :* ${totalTrx}\n\n`
        
        msg += `*› Cek Layanan Ketik :* PRODUK / LIST\n`
        msg += `*› Isi Saldo Ketik :* DEPOSIT / DEPO`

        m.reply(msg, { mentions: [m.sender] })
    }
}