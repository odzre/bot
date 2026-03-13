import { stockDb, saveStock, getUser, saveUsers, transaksiDb, saveTransaksi } from '../lib/database.js'
import { formatCurrency, CurrencyManager } from '../lib/helper.js'
import { createDeposit, checkDepositStatus } from '../lib/deposit.js'

export default {
    cmd: ['beli', 'beliqr'],
    category: 'store',
    run: async (m, { sock, args, command, config }) => {
        const user = getUser(m.sender)
        if (!user) return m.reply('❌ User data tidak ditemukan.')

        if (args.length < 2) {
            return m.reply(`*Format Salah*\n\nContoh: .${command} net1m 1`)
        }

        const code = args[0].toLowerCase()
        let qty = parseInt(args[1])
        if (isNaN(qty) || qty < 1) qty = 1

        if (!stockDb.products[code]) {
            return m.reply('❌ Kode unik produk tidak ditemukan pada sistem stock kami.')
        }

        const product = stockDb.products[code]
        if (!product.stock || product.stock.length < qty) {
            return m.reply(`❌ Maaf, stok untuk *${product.name}* tidak mencukupi.\nDiminta: ${qty}, Tersedia: ${product.stock ? product.stock.length : 0}`)
        }

        const rates = CurrencyManager.getRates()
        const totalPrice = product.price * qty

        if (command === 'beli') {
            if (user.saldo < totalPrice) {
                return m.reply(`❌ *Saldo Tidak Cukup*\n\n💰 Harga: ${formatCurrency(totalPrice, user.currency || 'IDR', rates)}\n💳 Saldo: ${formatCurrency(user.saldo, user.currency || 'IDR', rates)}\n\nSilakan deposit terlebih dahulu.`)
            }

            user.saldo -= totalPrice
            saveUsers()

            const itemsExtracted = product.stock.splice(0, qty)
            saveStock()

            transaksiDb.push({
                ref_id: 'AUTO-' + Date.now(),
                sku: product.code,
                product_name: product.name,
                status: 'Sukses',
                price: totalPrice,
                buyer_jid: m.sender,
                date: new Date().toLocaleString('id-ID')
            })
            saveTransaksi()

            await m.reply(`*✅ Pembayaran diterima! silahkan cek private message untuk invoice*`)
            sendInvoiceAndItems(sock, m.sender, product, totalPrice, qty, itemsExtracted, config, rates, user)
            return
        }

        if (command === 'beliqr') {
            await m.reply('⏳ Sedang memproses QRIS, mohon tunggu...')
            const res = await createDeposit(totalPrice)
            if (!res.success) return m.reply('❌ Gagal membuat QRIS: ' + res.message)

            const { buffer, refId: qrisRefId, amount: totalBayar, originalAmount, uniqueCode, fee } = res.data

            let msg = `──〔 *PEMBAYARAN OTOMATIS* 〕──\n`
            msg += `*» Layanan :* ${product.name}\n`
            msg += `*» Jumlah :* ${qty}\n`
            msg += `*» Harga Produk :* Rp ${originalAmount.toLocaleString('id-ID')} (${formatCurrency(originalAmount, user.currency || 'IDR', rates)})\n`
            if (fee > 0) msg += `*» Admin Fee :* Rp ${fee.toLocaleString('id-ID')} (${formatCurrency(fee, user.currency || 'IDR', rates)})\n`
            msg += `*» Kode Unik :* ${uniqueCode}\n`
            msg += `*» TOTAL BAYAR :* Rp ${totalBayar.toLocaleString('id-ID')} (${formatCurrency(totalBayar, user.currency || 'IDR', rates)})\n\n`
            msg += `⚠️ *PENTING:* Scan QRIS di atas dan bayar Sesuai *TOTAL BAYAR* agar otomatis terproses.\n`
            msg += `_Sistem akan mengecek pembayaran secara berkala..._`

            const sentMsg = await sock.sendMessage(m.from, { image: buffer, caption: msg }, { quoted: m })

            let attempts = 0
            const maxAttempts = 1000
            let isPaid = false

            const checkInterval = setInterval(async () => {
                if (isPaid) return clearInterval(checkInterval)
                attempts++

                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval)
                    if (sentMsg?.key) await sock.sendMessage(m.from, { delete: sentMsg.key })
                    return m.reply('❌ Waktu pembayaran habis. Silakan ulangi pesanan.')
                }

                const check = await checkDepositStatus(qrisRefId)

                if (check && check.data && check.data.status === 'paid') {
                    isPaid = true
                    clearInterval(checkInterval)

                    if (sentMsg?.key) await sock.sendMessage(m.from, { delete: sentMsg.key })

                    // Final check in case someone else bought using saldo while QR was pending
                    if (!product.stock || product.stock.length < qty) {
                        user.saldo += originalAmount
                        saveUsers()
                        return m.reply(`❌ Maaf, stok untuk *${product.name}* baru saja habis sebelum pembayaran Anda terverifikasi.\nDana sebesar ${formatCurrency(originalAmount, user.currency || 'IDR', rates)} telah dikembalikan ke saldo akun Anda.`)
                    }

                    const itemsExtracted = product.stock.splice(0, qty)
                    saveStock()

                    transaksiDb.push({
                        ref_id: qrisRefId,
                        sku: product.code,
                        product_name: product.name,
                        status: 'Sukses',
                        price: originalAmount,
                        buyer_jid: m.sender,
                        date: new Date().toLocaleString('id-ID')
                    })
                    saveTransaksi()

                    await m.reply(`*✅ Pembayaran diterima! silahkan cek private message untuk invoice*`)
                    sendInvoiceAndItems(sock, m.sender, product, originalAmount, qty, itemsExtracted, config, rates, user)
                }
            }, 3000)
        }
    }
}

async function sendInvoiceAndItems(sock, to, product, totalPrice, qty, items, config, rates, user) {
    let msg = `✅〔 *INVOICE TRANSAKSI* 〕✅\n\n`
    msg += `*› Kategori:* ${product.category}\n`
    msg += `*› Layanan:* ${product.name}\n`
    msg += `*› Harga:* ${formatCurrency(totalPrice, user.currency || 'IDR', rates)}\n\n`

    items.forEach((item, index) => {
        msg += `──〔 *Item ${index + 1}* 〕──\n`
        if (item.email) msg += `*› Email:* ${item.email}\n`
        if (item.password) msg += `*› Password:* ${item.password}\n`
        if (item.sn) msg += `*› SN:* ${item.sn}\n`
        msg += `\n`
    })

    msg += `Terima kasih telah melakukan transaksi 🙏\n\n`
    msg += `Complain? ${config.owner}`

    try {
        await sock.sendMessage(to, { text: msg })
    } catch (e) {
        console.error('Failed to send private message:', e)
    }
}
