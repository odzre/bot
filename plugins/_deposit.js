import { createDeposit, checkDepositStatus } from '../lib/deposit.js'
import { getUser, saveUsers } from '../lib/database.js'
import { parseCurrencyInput, convertToIdr, formatCurrency, CurrencyManager } from '../lib/helper.js'

export default {
    cmd: ['deposit', 'depo', 'batal'],
    category: 'user',
    run: async (m, { sock, args, command }) => {
        const user = getUser(m.sender)
        if (!user) return m.reply('User tidak ditemukan.')

        if (command === 'batal') {
            if (global.qrisIntervals && global.qrisIntervals[m.sender]) {
                clearInterval(global.qrisIntervals[m.sender].interval)
                const key = global.qrisIntervals[m.sender].key
                if (key) {
                    sock.sendMessage(m.from, { delete: key }).catch(() => { })
                }
                delete global.qrisIntervals[m.sender]
                return m.reply('❌ Pembayaran Dibatalkan!')
            }
            return
        }

        if (!args[0]) return m.reply('Masukan nominal deposit.\nContoh: .deposit 10000')

        const parsed = parseCurrencyInput(args[0], user.currency || 'IDR')
        const rates = CurrencyManager.getRates()
        const amountIdr = convertToIdr(parsed.value, parsed.currency, rates)

        if (amountIdr < 1000) return m.reply(`Minimal deposit Rp 1.000 (atau setara ${parsed.currency})`)
        const amount = amountIdr

        m.reply('Sedang membuat tagihan QRIS...')

        const res = await createDeposit(amount)
        if (!res.success) return m.reply(res.message)

        const { buffer, refId, amount: totalBayar, originalAmount, uniqueCode, fee } = res.data
        const jid = m.sender.split('@')[0]

        let msg = `──〔 *DETAIL DEPOSIT* 〕──\n`
        msg += `*» Ref ID :* ${refId}\n`
        msg += `*» No. WhatsApp :* ${jid}\n`

        if (fee > 0) {
            msg += `*» Admin Fee (0.7%) :* Rp ${fee.toLocaleString('id-ID')} (${formatCurrency(fee, parsed.currency, rates)})\n`
        }

        msg += `*» Kode Unik :* ${uniqueCode}\n`
        msg += `*» Jumlah Bayar :* Rp ${totalBayar.toLocaleString('id-ID')} (${formatCurrency(totalBayar, parsed.currency, rates)})\n`
        msg += `*» Jumlah Diterima :* Rp ${originalAmount.toLocaleString('id-ID')} (${formatCurrency(originalAmount, parsed.currency, rates)})\n`
        msg += `*Status : Pending*\n\n`
        msg += `Silakan scan QRIS melalui *BANK* atau e-Wallet seperti *Dana, Ovo, Gopay, Shopeepay, dll*\n\n`
        msg += `*note:* Ketik *.batal* jika ingin embatalkan tagihan ini.`

        const sentMsg = await sock.sendMessage(m.from, { image: buffer, caption: msg }, { quoted: m })

        let attempts = 0
        const maxAttempts = 1000
        let isSuccess = false
        const saldoSebelum = user.saldo

        const interval = setInterval(async () => {
            if (isSuccess) return clearInterval(interval)

            attempts++

            if (attempts >= maxAttempts) {
                clearInterval(interval)
                if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]

                if (sentMsg?.key) {
                    await sock.sendMessage(m.from, { delete: sentMsg.key })
                }

                return m.reply('❌ Waktu pembayaran habis. Silakan buat deposit ulang.')
            }

            const check = await checkDepositStatus(refId)

            if (check && check.data && check.data.status === 'paid') {
                isSuccess = true
                clearInterval(interval)
                if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]

                if (sentMsg?.key) {
                    await sock.sendMessage(m.from, { delete: sentMsg.key })
                }

                user.saldo += originalAmount
                saveUsers()

                const saldoSesudah = user.saldo

                let successMsg = `*» Reff ID :* ${refId}\n`
                successMsg += `*›  No. WhatsApp:* ${jid}\n`
                successMsg += `*› Nominal:* ${formatCurrency(originalAmount, parsed.currency, rates)}\n`
                successMsg += `*› Status:* succes\n\n`

                successMsg += `*› Saldo sebelum:* ${formatCurrency(saldoSebelum, parsed.currency, rates)}\n`
                successMsg += `*› Saldo Sesudah:* ${formatCurrency(saldoSesudah, parsed.currency, rates)}\n\n`

                successMsg += `*note :*\n`
                successMsg += `Saldo ini hanya bisa digunakan di bot ini, tidak dapat digunakan di tempat lain.`

                await sock.sendMessage(m.from, { text: successMsg }, { quoted: m })
            }
        }, 10000)

        global.qrisIntervals = global.qrisIntervals || {}
        global.qrisIntervals[m.sender] = { interval, key: sentMsg?.key }
    }
}