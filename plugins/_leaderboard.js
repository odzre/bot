import { transaksiDb, getUser } from '../lib/database.js'
import { formatCurrency, CurrencyManager } from '../lib/helper.js'

export default {
    cmd: ['lb', 'leaderboard'],
    category: 'user',
    run: async (m, { sock, args }) => {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1 // 1-12

        let startMonth = currentMonth
        let startYear = currentYear

        // Cek data transaksi yang sukses
        let validTransactions = transaksiDb.filter(trx => {
            if (trx.status !== 'Sukses') return false
            if (!trx.date) return false

            const dateStr = trx.date.split(',')[0].trim()
            const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-')

            let trxMonth = 0
            let trxYear = 0

            if (dateStr.includes('/')) {
                // node v20+ id-ID is D/M/YYYY
                trxMonth = parseInt(parts[1])
                trxYear = parseInt(parts[2])
            } else if (dateStr.includes('-')) {
                trxMonth = parseInt(parts[1])
                trxYear = parseInt(parts[0])
            }

            return trxMonth === startMonth && trxYear === startYear
        })

        if (validTransactions.length === 0) {
            return m.reply('❌ Belum ada transaksi bulan ini.')
        }

        // Aggregate by user
        let userStats = {}
        validTransactions.forEach(trx => {
            const jid = trx.buyer_jid || m.sender // Fallback
            if (!userStats[jid]) {
                userStats[jid] = { totalTagihan: 0, count: 0 }
            }
            userStats[jid].totalTagihan += parseInt(trx.price || 0)
            userStats[jid].count += 1
        })

        // Sort desc
        let leaderboard = Object.entries(userStats)
            .map(([jid, stats]) => ({ jid, ...stats }))
            .sort((a, b) => b.totalTagihan - a.totalTagihan)
            .slice(0, 10)

        // Konfigurasi Currency requestor
        const requestor = getUser(m.sender)
        const userCurrency = requestor ? (requestor.currency || 'IDR') : 'IDR'
        const rates = CurrencyManager.getRates()

        let msg = `*LEADERBOARD TOP 10 TRANSAKSI*\n`

        leaderboard.forEach((userItem, index) => {
            const number = userItem.jid.split('@')[0]
            msg += `*#Rank ${index + 1}*\n`
            msg += `> User: ${number}\n`
            msg += `> Jumlah Transaksi: ${userItem.count}\n`
            msg += `> Total Belanja: Rp ${userItem.totalTagihan.toLocaleString('id-ID')} ${userCurrency !== 'IDR' ? `(${formatCurrency(userItem.totalTagihan, userCurrency, rates)})` : ''}\n\n`
        })

        return m.reply(msg.trim())
    }
}
