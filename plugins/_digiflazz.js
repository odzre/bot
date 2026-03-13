import { checkProfile, updateProducts, topupRequest, statusRequest } from '../lib/digi.js'
import { digiDb, transaksiDb, saveTransaksi, digiAlias, getUser, marginDb, saveUsers } from '../lib/database.js'
import { makeInvoice } from '../lib/invoice.js'
import { checkGameId } from '../lib/cekid.js'
import { createDeposit, checkDepositStatus } from '../lib/deposit.js'
import { formatCurrency, CurrencyManager } from '../lib/helper.js'
import fs from 'fs'
import path from 'path'

const pendingPath = './database/pending.json'

const getPendingOrders = () => {
    if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, '{}')
    return JSON.parse(fs.readFileSync(pendingPath))
}

const savePendingOrder = (jid, data) => {
    const orders = getPendingOrders()
    orders[jid] = data
    fs.writeFileSync(pendingPath, JSON.stringify(orders, null, 2))
}

const deletePendingOrder = (jid) => {
    const orders = getPendingOrders()
    if (orders[jid]) {
        delete orders[jid]
        fs.writeFileSync(pendingPath, JSON.stringify(orders, null, 2))
        return true
    }
    return false
}

const generateRefId = () => {
    return 'TRX-' + Date.now()
}

const mapBrandToCekId = (brand) => {
    const b = brand.toLowerCase()
    if (b.includes('mobile legends')) return 'ml6'
    if (b.includes('free fire')) return 'ff1'
    if (b.includes('pubg')) return 'pubg2'
    if (b.includes('higgs')) return 'higgs'
    if (b.includes('honor of kings')) return 'hok1'
    if (b.includes('genshin')) return 'genshin1'
    if (b.includes('call of duty')) return 'codm1'
    if (b.includes('valorant')) return 'val1'
    if (b.includes('sausage')) return 'sm1'
    if (b.includes('point blank')) return 'pb1'
    return null
}

export default {
    cmd: ['produk', 'get', 'order', 'orderqr', 'saldodigi', 'digiupdate', 'cekstatus', 'y', 'n'],
    category: 'store',
    run: async (m, { sock, config, text, args, command }) => {

        const user = getUser(m.sender)
        if (!user) return m.reply('User data not found.')
        const rates = CurrencyManager.getRates()

        if (command === 'n') {
            let cancelled = false
            if (deletePendingOrder(m.sender)) {
                cancelled = true
            }
            if (global.qrisIntervals && global.qrisIntervals[m.sender]) {
                clearInterval(global.qrisIntervals[m.sender].interval)
                const key = global.qrisIntervals[m.sender].key
                if (key) {
                    sock.sendMessage(m.from, { delete: key }).catch(() => { })
                }
                delete global.qrisIntervals[m.sender]
                cancelled = true
            }
            if (cancelled) {
                return m.reply('*❎ Pembayaran tidak diterima, pesanan dibatalkan!*')
            }
        }

        if (command === 'y') {
            const orders = getPendingOrders()
            const order = orders[m.sender]

            if (!order) return

            deletePendingOrder(m.sender)

            if (user.saldo < order.price) return m.reply('❌ Saldo tidak cukup saat diproses.')

            user.saldo -= order.price
            saveUsers()

            await m.reply('*✅ Pembayaran diterima! pesanan kamu sedang diproses....*')

            processOrder(m, sock, user, order)
            return
        }

        const userRole = user.role || 'silver'
        const getPrice = (basePrice, role) => {
            const margin = marginDb[role] || marginDb.silver
            const percentAmt = Math.ceil(basePrice * margin.percent / 100)
            return basePrice + percentAmt + margin.flat
        }

        if (command === 'orderqr') {
            if (!text.includes(' ')) return m.reply('Format Salah.\nContoh: .orderqr ML5 12345678')
            let [sku, ...tujuanArr] = text.split(' ')
            let tujuan = tujuanArr.join('')

            if (!sku || !tujuan) return m.reply('Masukan Kode dan Tujuan.')

            const produk = digiDb.find(p => p.buyer_sku_code === sku)
            if (!produk) return m.reply('❌ Kode Produk tidak ditemukan.')
            if (!produk.seller_product_status) return m.reply('❌ Produk sedang gangguan.')

            const sellingPrice = getPrice(produk.price, userRole)

            let nickname = '-'
            let region = '-'
            const gameKey = mapBrandToCekId(produk.brand)
            if (gameKey) {
                let idGame = args[1]
                let zoneGame = args[2] || ''
                try {
                    const checkRes = await checkGameId(gameKey, idGame, zoneGame)
                    if (checkRes.status) {
                        nickname = checkRes.data.nickname
                        region = checkRes.data.region || '-'
                        if (zoneGame) tujuan = `${idGame}${zoneGame}`
                    }
                } catch (e) { }
            }

            m.reply('⏳ Mohon tunggu, sedang membuat QRIS pembayaran...')

            const res = await createDeposit(sellingPrice)
            if (!res.success) return m.reply('❌ Gagal membuat QRIS: ' + res.message)

            const { buffer, refId: qrisRefId, amount: totalBayar, originalAmount, uniqueCode, fee } = res.data

            let msg = `──〔 *PEMBAYARAN OTOMATIS* 〕──\n`
            msg += `*» Item :* ${produk.product_name}\n`
            msg += `*» Tujuan :* ${tujuan}\n`
            msg += `*» Nickname :* ${nickname}\n`
            msg += `*» Region :* ${region}\n`
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
            const trxRefId = generateRefId()

            const interval = setInterval(async () => {
                if (isPaid) return clearInterval(interval)
                attempts++

                if (attempts >= maxAttempts) {
                    clearInterval(interval)
                    if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]
                    if (sentMsg?.key) await sock.sendMessage(m.from, { delete: sentMsg.key })
                    return m.reply('❌ Waktu pembayaran habis. Silakan ulangi pesanan.')
                }

                const check = await checkDepositStatus(qrisRefId)

                if (check && check.data && check.data.status === 'paid') {
                    isPaid = true
                    clearInterval(interval)
                    if (global.qrisIntervals && global.qrisIntervals[m.sender]) delete global.qrisIntervals[m.sender]

                    if (sentMsg?.key) await sock.sendMessage(m.from, { delete: sentMsg.key })

                    await m.reply('✅ *Pembayaran Diterima!* Sedang memproses pesanan...')

                    const orderData = {
                        sku: sku,
                        tujuan: tujuan,
                        product_name: produk.product_name,
                        brand: produk.brand,
                        price: sellingPrice,
                        buyPrice: produk.price,
                        refId: trxRefId,
                        nickname: nickname,
                        region: region
                    }

                    processOrderQR(m, sock, user, orderData)
                }
            }, 10000)

            global.qrisIntervals = global.qrisIntervals || {}
            global.qrisIntervals[m.sender] = { interval, key: sentMsg?.key }
            return
        }

        if (command === 'produk') {
            const totalLayanan = digiDb.length
            const uniqueBrands = [...new Set(digiDb.map(item => item.brand))]
            const totalBrand = uniqueBrands.length
            const uniqueCategories = [...new Set(digiDb.map(item => item.category))]
            const totalKategori = uniqueCategories.length

            let trendingMsg = ''
            if (transaksiDb.length > 0) {
                const brandCounts = {}
                transaksiDb.forEach(trx => {
                    let brandName = trx.brand
                    if (!brandName) {
                        const product = digiDb.find(p => p.buyer_sku_code === trx.sku)
                        if (product) brandName = product.brand
                    }
                    if (brandName) brandCounts[brandName] = (brandCounts[brandName] || 0) + 1
                })
                const topBrands = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a]).slice(0, 3)

                if (topBrands.length > 0) {
                    trendingMsg += `\`TRENDING SEKARANG\`✨\n`
                    topBrands.forEach(brand => {
                        const aliasKey = Object.keys(digiAlias).find(key => digiAlias[key].brand === brand)
                        const displayAlias = aliasKey ? aliasKey.toUpperCase() : '???'
                        trendingMsg += `*› GET ${displayAlias}* [ ${brand.toUpperCase()} ]\n`
                    })
                    trendingMsg += `\n`
                }
            }

            let grouped = {}
            Object.keys(digiAlias).forEach(alias => {
                const item = digiAlias[alias]
                const catName = item.category || 'LAINNYA'
                if (!grouped[catName]) grouped[catName] = []
                grouped[catName].push({ alias, brand: item.brand })
            })

            let msg = `┏━━『 ${config.namastore} 』━◧\n`
            msg += `┣» 🌟 LAYANAN OTOMATIS 🌟\n`
            msg += `┣» Silahkan Ketik Kode Produk Untuk Menampilkan Harga\n`
            msg += `   » Contoh : GET ML\n\n`

            Object.keys(grouped).sort().forEach(cat => {
                msg += `┣»  ${cat.toUpperCase()} \n`

                // Sort items by brand alphabetically
                grouped[cat].sort((a, b) => a.brand.localeCompare(b.brand)).forEach(i => {
                    msg += `┃🛍️ GET ${i.alias.toUpperCase()}     ${i.brand.toUpperCase()}\n`
                })
                msg += `\n`
            })

            msg += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`

            return m.reply(msg)
        }

        if (command === 'get') {
            if (!text) return m.reply('Masukan nama alias.\nContoh: .get ml')
            const keyword = text.toLowerCase().trim()
            if (!digiAlias[keyword]) return m.reply(`❌ Alias *${keyword}* tidak ditemukan.\nCek daftar alias di menu *.produk*`)

            const map = digiAlias[keyword]
            const typeFilters = map.type.split(',').map(t => t.trim().toLowerCase())
            const catFilters = map.category ? map.category.toLowerCase().split(',') : []

            let search = digiDb.filter(item => {
                const isBrand = item.brand.toLowerCase() === map.brand.toLowerCase()
                const isType = typeFilters.some(t => item.type.toLowerCase().includes(t))
                let isCat = true
                if (catFilters.length > 0 && map.category !== 'All') {
                    isCat = catFilters.some(c => item.category.toLowerCase().includes(c.trim()))
                }
                return isBrand && isType && isCat
            })

            if (search.length === 0) return m.reply('Produk kosong atau sedang gangguan.')

            search.sort((a, b) => getPrice(a.price, 'silver') - getPrice(b.price, 'silver'))

            let msg = `╭────────────────✧\n`
            msg += `┊ *PRODUK : ${map.brand.toUpperCase()}*\n`
            msg += `┊  *cara membuat pesanan :*\n`
            msg += `┊  *format:* order [kode] [id] [server]\n`
            msg += `┊  *contoh:* order ml50 38299191 1234\n`
            msg += `┊  *note:* deposit / isi saldo ketik .depo\n`
            msg += `╰────────────────✧\n\n`

            search.forEach(item => {
                let status = item.seller_product_status ? '✅' : '❌'
                let pSilver = formatCurrency(getPrice(item.price, 'silver'), user.currency || 'IDR', rates)
                let pGold = formatCurrency(getPrice(item.price, 'gold'), user.currency || 'IDR', rates)
                let pPrem = formatCurrency(getPrice(item.price, 'premium'), user.currency || 'IDR', rates)

                msg += `*🛍️ ${item.product_name}*\n`
                msg += `> Silver : ${pSilver}\n`
                msg += `> Gold : ${pGold}\n`
                msg += `> Premium : ${pPrem}\n`
                msg += `> Kode : ${item.buyer_sku_code}\n`
                msg += `> Status : ${status}\n\n`
            })

            m.reply(msg)
        }

        if (command === 'order') {
            if (!text.includes(' ')) return m.reply('Format Salah.\nContoh: .order ML5 12345678')
            let [sku, ...tujuanArr] = text.split(' ')
            let tujuan = tujuanArr.join('')

            if (!sku || !tujuan) return m.reply('Masukan Kode dan Tujuan.')

            const produk = digiDb.find(p => p.buyer_sku_code === sku)
            if (!produk) return m.reply('❌ Kode Produk tidak ditemukan.')
            if (!produk.seller_product_status) return m.reply('❌ Produk sedang gangguan.')

            const sellingPrice = getPrice(produk.price, userRole)
            if (user.saldo < sellingPrice) {
                return m.reply(`❌ *Saldo Tidak Cukup*\n\n💰 Harga: ${formatCurrency(sellingPrice, user.currency || 'IDR', rates)}\n💳 Saldo: ${formatCurrency(user.saldo, user.currency || 'IDR', rates)}\n\nSilakan deposit terlebih dahulu.`)
            }

            let nickname = '-'
            let region = '-'

            const gameKey = mapBrandToCekId(produk.brand)
            if (gameKey) {
                let idGame = args[1]
                let zoneGame = args[2] || ''

                try {
                    const checkRes = await checkGameId(gameKey, idGame, zoneGame)
                    if (checkRes.status) {
                        nickname = checkRes.data.nickname
                        region = checkRes.data.region || '-'
                        if (zoneGame) tujuan = `${idGame}${zoneGame}`
                    }
                } catch (e) {
                }
            }

            const refId = generateRefId()

            savePendingOrder(m.sender, {
                sku: sku,
                tujuan: tujuan,
                product_name: produk.product_name,
                brand: produk.brand,
                price: sellingPrice,
                buyPrice: produk.price,
                refId: refId,
                nickname: nickname,
                region: region
            })

            let confirmMsg = `*KONFIRMASI PESANAN*\n\n`
            confirmMsg += `> Produk : ${produk.product_name}\n`
            confirmMsg += `> Tujuan : ${tujuan}\n`
            confirmMsg += `> Nickname : ${nickname}\n`
            confirmMsg += `> Region : ${region}\n`
            confirmMsg += `> Harga per item : ${formatCurrency(sellingPrice, user.currency || 'IDR', rates)}\n`
            confirmMsg += `> Jumlah Pembelian : 1x\n`
            confirmMsg += `> Total Harga : ${formatCurrency(sellingPrice, user.currency || 'IDR', rates)}\n`
            confirmMsg += `> Ref ID : ${refId}\n\n`
            confirmMsg += `Apakah data diatas sudah benar?\n`
            confirmMsg += `Silakan ketik *Y* untuk melanjutkan, atau *N* untuk membatalkan.`

            return m.reply(confirmMsg)
        }

        if (command === 'cekstatus') {
            let [sku, tujuan, refId] = text.split(' ')
            if (!sku || !tujuan || !refId) return m.reply('Format: .cekstatus SKU TUJUAN REFID')
            const res = await statusRequest(sku, tujuan, refId)
            if (res.data) {
                const { rc, sn, human_message } = res.data
                let status = (rc === '00') ? 'Sukses' : (rc === '03') ? 'Pending' : 'Gagal'
                let icon = rc === '00' ? '✅' : (rc === '03' ? '🕒' : '❌')
                let msg = `📡 *STATUS UPDATE*\n\nRefID: ${refId}\nStatus: ${icon} *${status}*\nSN: ${sn || '-'}\nInfo: ${human_message}`
                m.reply(msg)
            } else {
                m.reply('Data transaksi tidak ditemukan.')
            }
        }

        if (command === 'saldodigi') {
            if (!m.isOwner) return m.reply('Khusus Owner.')
            const res = await checkProfile()
            if (res.data) {
                let saldo = res.data.deposit.toLocaleString('id-ID')
                return m.reply(`💰 *INFO SALDO*\n\nRp ${saldo} (${formatCurrency(res.data.deposit, user.currency || 'IDR', rates)})\nUser: ${res.data.username}`)
            }
            return m.reply('Gagal koneksi ke API.')
        }

        if (command === 'digiupdate') {
            if (!m.isOwner) return m.reply('Khusus Owner.')
            m.reply('Memulai update produk... (Tunggu sebentar)')
            const res = await updateProducts()
            if (res.success) return m.reply(`✅ Update Sukses!\nTotal: ${res.total}\nAlias Baru: +${res.newAliases}`)
            return m.reply(`❌ Update Gagal: ${res.message}`)
        }
    }
}

async function processOrderQR(m, sock, user, order) {
    const res = await topupRequest(order.sku, order.tujuan, order.refId)

    if (!res.data) {
        user.saldo += order.price
        saveUsers()
        return m.reply('❌ Gagal menghubungi server pusat. Dana pembayaran telah dikembalikan ke Saldo Akun.')
    }

    const { rc, human_message } = res.data
    const realRefId = res.data.ref_id_used || res.data.ref_id || order.refId

    const trxData = {
        ref_id: realRefId,
        sku: order.sku,
        product_name: order.product_name,
        brand: order.brand,
        tujuan: order.tujuan,
        status: (rc === '00') ? 'Sukses' : (rc === '03' ? 'Pending' : 'Gagal'),
        sn: '',
        price: order.price,
        buy_price: order.buyPrice,
        buyer_jid: m.sender,
        date: new Date().toLocaleString('id-ID'),
        nickname: order.nickname,
        region: order.region
    }
    transaksiDb.push(trxData)
    saveTransaksi()

    if (rc !== '00' && rc !== '03') {
        user.saldo += order.price
        saveUsers()
        return m.reply(`❌ *TRANSAKSI GAGAL*\n\nAlasan: ${human_message}\n_Dana pembayaran telah dikembalikan ke Saldo Akun._`)
    }

    monitorTransaction(m, sock, user, order, realRefId, true)
}

async function processOrder(m, sock, user, order) {
    const res = await topupRequest(order.sku, order.tujuan, order.refId)

    if (!res.data) {
        user.saldo += order.price
        saveUsers()
        return m.reply('❌ Gagal menghubungi server pusat. Saldo dikembalikan.')
    }

    const { rc, human_message } = res.data
    const realRefId = res.data.ref_id_used || res.data.ref_id || order.refId

    const trxData = {
        ref_id: realRefId,
        sku: order.sku,
        product_name: order.product_name,
        brand: order.brand,
        tujuan: order.tujuan,
        status: (rc === '00') ? 'Sukses' : (rc === '03' ? 'Pending' : 'Gagal'),
        sn: '',
        price: order.price,
        buy_price: order.buyPrice,
        buyer_jid: m.sender,
        date: new Date().toLocaleString('id-ID'),
        nickname: order.nickname,
        region: order.region
    }
    transaksiDb.push(trxData)
    saveTransaksi()

    if (rc !== '00' && rc !== '03') {
        user.saldo += order.price
        saveUsers()
        return m.reply(`❌ *TRANSAKSI GAGAL*\n\nAlasan: ${human_message}\n_Saldo telah dikembalikan._`)
    }

    monitorTransaction(m, sock, user, order, realRefId, false)
}

function monitorTransaction(m, sock, user, order, realRefId, isQrOrder) {
    let attempts = 0
    const maxAttempts = 600
    let isFinished = false

    const checkInterval = setInterval(async () => {
        if (isFinished) return
        attempts++

        const check = await statusRequest(order.sku, order.tujuan, realRefId)

        if (check.data) {
            const currentRc = check.data.rc
            const sn = check.data.sn || ''
            const msgServer = check.data.message || ''

            const dbIndex = transaksiDb.findIndex(t => t.ref_id === realRefId)
            if (dbIndex !== -1) {
                if (sn) transaksiDb[dbIndex].sn = sn
                if (currentRc === '00') transaksiDb[dbIndex].status = 'Sukses'
                else if (currentRc !== '03') transaksiDb[dbIndex].status = 'Gagal'
                saveTransaksi()
            }

            if (currentRc === '00') {
                isFinished = true
                clearInterval(checkInterval)

                let finalSn = sn
                if (!finalSn || finalSn.includes('=')) {
                    finalSn = `User ID ${order.tujuan} / Username ${order.nickname} / Region = ${order.region}`
                }

                const buffer = await makeInvoice({
                    refId: realRefId,
                    date: new Date().toLocaleString('id-ID'),
                    status: 'SUKSES',
                    product: order.product_name,
                    tujuan: order.tujuan,
                    nickname: order.nickname,
                    sn: finalSn
                })

                let successMsg = `✅〔 *TRANSAKSI SUKSES* 〕✅\n\n`
                successMsg += `*» Trxid:* #${realRefId}\n`
                successMsg += `*» Produk:* ${order.product_name}\n`
                const rates = CurrencyManager.getRates()
                successMsg += `*» Tujuan:* ${order.tujuan}\n`
                successMsg += `*» Nickname :* ${order.nickname}\n`
                successMsg += `*» Harga:* ${formatCurrency(order.price, user.currency || 'IDR', rates)}\n`
                successMsg += `*» Tanggal:* ${new Date().toLocaleDateString('id-ID')}\n`
                successMsg += `*» Jam:* ${new Date().toLocaleTimeString('id-ID')} WIB\n`
                successMsg += `*» Status:* Success\n`
                if (!isQrOrder) successMsg += `*» Saldo Akhir:* ${formatCurrency(user.saldo, user.currency || 'IDR', rates)}\n\n`
                else successMsg += `*» Metode:* QRIS Langsung\n\n`

                successMsg += `──〔 *Serial Number* 〕──\n`
                successMsg += `${finalSn}\n\n`
                successMsg += `Terima kasih telah melakukan transaksi disini`

                await sock.sendMessage(m.from, { image: buffer, caption: successMsg }, { quoted: m })
            }
            else if (currentRc !== '03') {
                isFinished = true
                clearInterval(checkInterval)

                user.saldo += order.price
                saveUsers()

                const rates = CurrencyManager.getRates()
                let msg = `❌ *TRANSAKSI GAGAL*\n\n`
                msg += `📦 Item: ${order.product_name}\n`
                msg += `📝 Ket: ${check.data.human_message || msgServer}\n`
                msg += `_Dana ${formatCurrency(order.price, user.currency || 'IDR', rates)} telah dikembalikan ke Saldo Akun._`
                await sock.sendMessage(m.from, { text: msg }, { quoted: m })
            }
        }

        if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
        }
    }, 10000)
}
