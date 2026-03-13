import { createDeposit, checkDepositStatus } from '../lib/deposit.js'
import { getUser, saveUsers } from '../lib/database.js'
import { formatCurrency, CurrencyManager } from '../lib/helper.js'

const rolePrices = {
    'gold': 10000,
    'premium': 25000
}

export default {
    cmd: ['uprole', 'benefit'],
    category: 'user',
    run: async (m, { sock, text, config, command }) => {
        const user = getUser(m.sender)
        if (!user) return m.reply('User tidak ditemukan.')

        if (!text || command === 'benefit') {
            const rates = CurrencyManager.getRates()
            let msg = `*Upgrade ke Level Reseller Premium!*\n\n`
            msg += `Apakah Anda ingin mengambil bisnis produk digital Anda ke level berikutnya? Upgrade peran Anda menjadi Silver atau Gold sekarang untuk menikmati manfaat luar biasa berikut:\n\n`
            msg += `*Manfaat Upgrade:*\n`
            msg += `1. Harga Produk Lebih Murah: Dapatkan harga produk yang lebih rendah, memberikan keuntungan besar dalam bisnis produk digital Anda.\n`
            msg += `2. Proses Otomatisasi: Mudah dan efisien. Tidak perlu ribet dengan pembuatan situs web, semuanya dapat diatur melalui WhatsApp.\n`
            msg += `3. Beragam Pilihan Produk: Tersedia berbagai pilihan produk, seperti game, pulsa, token PLN, dan banyak lagi.\n\n`

            msg += `*Ayo Mulai Bisnis Anda Sekarang!*\n`
            msg += `- Upgrade ke Level GOLD: Rp ${rolePrices.gold.toLocaleString('id-ID')} ${user.currency !== 'IDR' ? `(${formatCurrency(rolePrices.gold, user.currency || 'IDR', rates)})` : ''}\n`
            msg += `- Upgrade ke Level PREMIUM: Rp ${rolePrices.premium.toLocaleString('id-ID')} ${user.currency !== 'IDR' ? `(${formatCurrency(rolePrices.premium, user.currency || 'IDR', rates)})` : ''}\n\n`

            msg += `Tidak ada batasan waktu, Anda dapat menjadi Reseller Produk Digital bersama Bot Bangirul Store!\n\n`
            msg += `Jadi, tertarik untuk menjadi seorang Reseller? Silahkan ketik format berikut :\n\n`
            msg += `.uprole GOLD\n`
            msg += `.uprole PREMIUM`

            return m.reply(msg)
        }

        const targetRole = text.toLowerCase()

        if (!rolePrices[targetRole]) {
            return m.reply('❌ Role tidak tersedia. Pilih *gold* atau *premium*.')
        }

        const currentRole = user.role || 'silver'
        if (currentRole === targetRole) {
            return m.reply(`❌ Kamu sudah berada di role *${targetRole.toUpperCase()}*.`)
        }
        if (currentRole === 'premium' && targetRole === 'gold') {
            return m.reply('❌ Kamu sudah Premium (Role Tertinggi), tidak bisa turun ke Gold.')
        }

        const price = rolePrices[targetRole]

        await m.reply(`⏳ Sedang membuat tagihan QRIS untuk upgrade ke *${targetRole.toUpperCase()}*...`)

        const res = await createDeposit(price)
        if (!res.success) return m.reply('❌ Gagal membuat QRIS: ' + res.message)

        const { buffer, refId, amount: totalBayar, uniqueCode, fee } = res.data
        const jid = m.sender.split('@')[0]

        let msg = `──〔 *TAGIHAN UPGRADE ROLE* 〕──\n`
        const rates = CurrencyManager.getRates()
        msg += `*» Target Role :* ${targetRole.toUpperCase()}\n`
        msg += `*» User :* ${jid}\n`
        msg += `*» Harga :* Rp ${price.toLocaleString('id-ID')} (${formatCurrency(price, user.currency || 'IDR', rates)})\n`
        if (fee > 0) msg += `*» Admin Fee :* Rp ${fee.toLocaleString('id-ID')} (${formatCurrency(fee, user.currency || 'IDR', rates)})\n`
        msg += `*» Kode Unik :* ${uniqueCode}\n`
        msg += `*» TOTAL BAYAR :* Rp ${totalBayar.toLocaleString('id-ID')} (${formatCurrency(totalBayar, user.currency || 'IDR', rates)})\n\n`
        msg += `⚠️ *PENTING:* Scan QRIS di atas dan bayar Sesuai *TOTAL BAYAR* agar otomatis terproses.\n`
        msg += `*note:* Ketik *.batal* jika ingin membatalkan tagihan ini.`

        const sentMsg = await sock.sendMessage(m.from, { image: buffer, caption: msg }, { quoted: m })

        let attempts = 0
        const maxAttempts = 1000
        let isSuccess = false

        const interval = setInterval(async () => {
            if (isSuccess) return clearInterval(interval)

            attempts++

            if (attempts >= maxAttempts) {
                clearInterval(interval)
                if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]

                if (sentMsg?.key) {
                    await sock.sendMessage(m.from, { delete: sentMsg.key })
                }
                return m.reply('❌ Waktu pembayaran habis. Silakan ulangi perintah.')
            }

            const check = await checkDepositStatus(refId)

            if (check && check.data && check.data.status === 'paid') {
                isSuccess = true
                clearInterval(interval)
                if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]

                if (sentMsg?.key) {
                    await sock.sendMessage(m.from, { delete: sentMsg.key })
                }

                user.role = targetRole
                saveUsers()

                let successMsg = `✅ *PEMBAYARAN DITERIMA*\n\n`
                successMsg += `Selamat! Role kamu berhasil diupgrade.\n`
                successMsg += `👑 *Role Baru:* ${targetRole.toUpperCase()}\n`
                successMsg += `Sekarang kamu bisa menikmati harga yang lebih murah!`

                await sock.sendMessage(m.from, { text: successMsg }, { quoted: m })
            }
        }, 10000)

        global.qrisIntervals = global.qrisIntervals || {}
        global.qrisIntervals[m.sender] = { interval, key: sentMsg?.key }
    }
}