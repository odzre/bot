import { stockDb, saveStock, getUser } from '../lib/database.js'
import { formatCurrency, CurrencyManager } from '../lib/helper.js'

export default {
    cmd: ['stock', 'addkategori', 'addlayanan', 'addemail', 'addpassword', 'addsn'],
    category: 'store',

    before: async (m, { sock, config, text }) => {
        if (stockDb.categories && stockDb.categories.length > 0) {
            const num = parseInt(text || m.body)
            if (!isNaN(num) && num > 0 && num <= stockDb.categories.length) {
                const selectedCat = stockDb.categories[num - 1]
                const products = Object.values(stockDb.products).filter(p => p.category === selectedCat)

                const user = getUser(m.sender)
                const userCurrency = user ? (user.currency || 'IDR') : 'IDR'

                const rates = CurrencyManager.getRates()

                let msg = `〔 📖 *PANDUAN ORDER* 📖 〕\n`
                msg += `> ・ *beli : untuk order pakai saldo*\n`
                msg += `> ・ *beliqr : untuk order pakai qris*\n`
                msg += `> ・ *beli <kode> <jumlah>*\n`
                msg += `> ・ Contoh: *beli am 1*\n`
                msg += `> ・ Pastikan format sudah benar\n`
                msg += `> ・ Owner : ${config.owner}\n`
                msg += `▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒\n\n`
                msg += `╼━〔 📦 *LIST PRODUK* 📦 〕━╾\n\n`

                products.forEach(p => {
                    msg += ` *╼〔 ${p.name.toUpperCase()} 〕╾*\n`
                    msg += `*┊・ 🔐Kode* : ${p.code}\n`

                    if (userCurrency === 'IDR') {
                        msg += `*┊・ 🏷️Harga* : Rp ${p.price.toLocaleString('id-ID')}\n`
                    } else {
                        msg += `*┊・ 🏷️Harga* : Rp ${p.price.toLocaleString('id-ID')} / ${formatCurrency(p.price, userCurrency, rates)}\n`
                    }

                    msg += `*┊・ 📦Stok Tersedia* : ${p.stock ? p.stock.length : 0}\n`
                    msg += `*┊・ 📝Note* : ${p.desc}\n`
                    msg += `*╰╼━━━━━━━━━━━━━━╾─*\n\n`
                })

                if (products.length === 0) msg += `_Kosong_\n`

                return m.reply(msg)
            }
        }
    },

    run: async (m, { text, command }) => {
        if (command === 'addkategori') {
            if (!m.isOwner) return m.reply('❌ Perintah ini hanya untuk Owner.')
            if (!text) return m.reply('Format salah!\n\nContoh: .addkategori VOUCHER NETFLIX')

            const catName = text.trim()
            if (stockDb.categories.includes(catName)) return m.reply(`Kategori *${catName}* sudah ada.`)

            stockDb.categories.push(catName)
            saveStock()
            return m.reply(`✅ Berhasil menambahkan kategori: *${catName}*`)
        }

        if (command === 'addlayanan') {
            if (!m.isOwner) return m.reply('❌ Perintah ini hanya untuk Owner.')

            const split = text.split(',')
            if (split.length < 5) return m.reply('Format salah!\n\nContoh: .addlayanan Netflix,Netflix 1 Bulan,net1m,25000,Garansi 1 bulan no hold')

            const category = split[0].trim()
            const name = split[1].trim()
            const code = split[2].trim().toLowerCase()
            const price = parseInt(split[3].trim())
            const desc = split.slice(4).join(',').trim()

            if (!stockDb.categories.includes(category)) return m.reply(`❌ Kategori *${category}* tidak ditemukan. Buat dulu dengan .addkategori`)
            if (stockDb.products[code]) return m.reply(`❌ Layanan dengan kode *${code}* sudah ada.`)

            stockDb.products[code] = {
                category: category,
                name: name,
                code: code,
                price: price,
                desc: desc,
                stock: []
            }
            saveStock()
            return m.reply(`✅ Berhasil menambahkan produk: *${name}* (${code}) Rp ${price}`)
        }

        if (command === 'addemail' || command === 'addpassword' || command === 'addsn') {
            if (!m.isOwner) return m.reply('❌ Perintah ini hanya untuk Owner.')
            if (!text.includes('|')) return m.reply(`Format salah!\n\nContoh:\n.addemail net1m|email1@x.com,email2@x.com\n.addpassword net1m|pass1,pass2\n.addsn net1m|sn1,sn2`)

            const [codePart, itemsPart] = text.split('|')
            const code = codePart.trim().toLowerCase()
            const items = itemsPart.split(',').map(i => i.trim()).filter(i => i)

            if (!stockDb.products[code]) return m.reply(`❌ Produk dengan kode *${code}* tidak ditemukan.`)

            const product = stockDb.products[code]
            let added = 0

            items.forEach((item) => {
                let stockIndex = -1
                if (command === 'addemail') {
                    stockIndex = product.stock.findIndex(s => !s.email)
                    if (stockIndex === -1) {
                        product.stock.push({ email: item, password: '', sn: '' })
                    } else {
                        product.stock[stockIndex].email = item
                    }
                } else if (command === 'addpassword') {
                    stockIndex = product.stock.findIndex(s => !s.password)
                    if (stockIndex === -1) {
                        product.stock.push({ email: '', password: item, sn: '' })
                    } else {
                        product.stock[stockIndex].password = item
                    }
                } else if (command === 'addsn') {
                    stockIndex = product.stock.findIndex(s => !s.sn)
                    if (stockIndex === -1) {
                        product.stock.push({ email: '', password: '', sn: item })
                    } else {
                        product.stock[stockIndex].sn = item
                    }
                }
                added++
            })

            saveStock()
            return m.reply(`✅ Berhasil menambahkan ${added} data ke stok *${code}*`)
        }

        if (command === 'stock') {
            if (!stockDb.categories || stockDb.categories.length === 0) return m.reply('❌ Belum ada kategori stok yang ditambahkan.')

            let msg = `*🛍️ LIST PRODUK TERSEDIA*\n\n`
            stockDb.categories.forEach((cat, index) => {
                msg += `[${index + 1}] ${cat}\n`
            })
            msg += `\n*Note:*\nKetik angka untuk melihat produk dalam kategori`

            return m.reply(msg)
        }
    }
}
