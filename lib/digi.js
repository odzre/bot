import crypto from 'crypto'
import config from '../config.js'
import { digiDb, saveDigi, digiAlias, saveDigiAlias } from './database.js'

const BASE_URL = 'https://api.digiflazz.com/v1'
const { digiUser, digiKey } = config

const generateRefId = () => {
    return 'TRX-' + Date.now()
}

const parseError = (rc) => {
    const codes = {
        '00': 'Transaksi Sukses',
        '01': 'Timeout',
        '02': 'Transaksi Gagal',
        '03': 'Transaksi Pending',
        '40': 'Payload Error',
        '41': 'Signature tidak valid',
        '42': 'Username salah',
        '43': 'Produk tidak ditemukan atau Non-Aktif',
        '44': 'Saldo tidak cukup',
        '45': 'IP Bot belum diizinkan',
        '47': 'Transaksi double',
        '49': 'Ref ID tidak unik',
        '50': 'Transaksi Tidak Ditemukan',
        '51': 'Nomor Tujuan Diblokir',
        '52': 'Prefix Tidak Sesuai Operator',
        '53': 'Produk Seller Sedang Tidak Tersedia',
        '54': 'Nomor Tujuan Salah',
        '55': 'Produk Sedang Gangguan',
        '56': 'Limit saldo seller',
        '57': 'Jumlah Digit Kurang/Lebih',
        '58': 'Sedang Cut Off',
        '59': 'Tujuan di Luar Wilayah/Cluster',
        '60': 'Tagihan belum tersedia',
        '61': 'Belum pernah deposit',
        '62': 'Seller sedang gangguan',
        '63': 'Tidak support multi transaksi',
        '64': 'Tarik tiket gagal',
        '65': 'Limit transaksi multi',
        '66': 'Cut Off',
        '67': 'Seller belum terverifikasi',
        '68': 'Stok habis',
        '69': 'Harga seller > harga buyer',
        '70': 'Timeout Dari Biller',
        '71': 'Produk Sedang Tidak Stabil',
        '72': 'Lakukan Unreg Paket Dahulu',
        '73': 'Kwh Melebihi Batas',
        '74': 'Transaksi Refund',
        '80': 'Akun diblokir oleh Seller',
        '81': 'Seller diblokir oleh Anda',
        '82': 'Akun belum terverifikasi',
        '83': 'Limitasi update pricelist',
        '84': 'Nominal tidak valid',
        '85': 'Limitasi transaksi',
        '86': 'Limitasi cek PLN',
        '87': 'E-money wajib kelipatan 1.000',
        '99': 'Router Issue'
    }
    return codes[rc] || `Error Tidak Diketahui (RC: ${rc})`
}

const sign = (verb, id = '') => {
    let raw = digiUser + digiKey + verb
    if (id) raw = digiUser + digiKey + id
    return crypto.createHash('md5').update(raw).digest('hex')
}

const digiFetch = async (endpoint, payload) => {
    try {
        const req = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        return await req.json()
    } catch (e) {
        return { data: null, error: e.message }
    }
}

const getCategorySuffix = (category) => {
    const cat = category.toLowerCase().trim()

    if (cat === 'aktivasi voucher') return 'avc'
    if (cat === 'paket sms & telepon') return 'pst'

    const words = cat.split(' ')

    if (words.length === 1) {
        return cat.substring(0, 3)
    }

    if (words.length >= 2) {
        let acronym = words.filter(w => w !== '&').map(w => w[0]).join('')

        if (acronym.length < 3 && words[1]) {
            acronym += words[1][1]
        }
        return acronym.substring(0, 3)
    }

    return cat.substring(0, 3)
}

export const checkProfile = async () => {
    const payload = {
        cmd: 'depo',
        username: digiUser,
        sign: sign('depo')
    }
    const res = await digiFetch('/cek-saldo', payload)
    if (res.data) res.data.message = parseError(res.data.rc)
    return res
}

export const updateProducts = async () => {
    const payload = {
        cmd: 'prepaid',
        username: digiUser,
        sign: sign('pricelist')
    }

    //  console.log('[DIGI] Sedang mengambil update produk...')
    const res = await digiFetch('/price-list', payload)

    if (res.data && Array.isArray(res.data)) {
        const activeProducts = res.data.filter(p => p.buyer_product_status === true && p.category !== 'Pasca Bayar')

        digiDb.length = 0
        activeProducts.forEach(p => digiDb.push(p))
        saveDigi()

        let newAliases = 0
        const brandMap = {}

        activeProducts.forEach(p => {
            if (!brandMap[p.brand]) brandMap[p.brand] = { types: new Set(), categories: new Set() }
            brandMap[p.brand].types.add(p.type)
            brandMap[p.brand].categories.add(p.category)
        })

        const targetCategories = [
            'Pulsa',
            'Data',
            'Voucher',
            'Paket SMS & Telepon',
            'Aktivasi Voucher',
            'Masa Aktif',
            'Aktivasi Perdana'
        ]

        Object.keys(brandMap).forEach(brand => {
            const cleanBrand = brand.replace(/[^a-zA-Z0-9 ]/g, '')
            const words = cleanBrand.split(' ').filter(w => w.trim() !== '')
            let brandAcronym = ''

            if (words.length > 1) {
                brandAcronym = words.map(w => w[0]).join('').toLowerCase()
            } else {
                brandAcronym = words[0].toLowerCase().substring(0, 4)

                if (brand === 'Telkomsel') brandAcronym = 'tsel'
                if (brand === 'Indosat') brandAcronym = 'isat'
                if (brand === 'Tri') brandAcronym = 'tri'
                if (brand === 'XL') brandAcronym = 'xl'
                if (brand === 'Axis') brandAcronym = 'axis'
            }

            const types = Array.from(brandMap[brand].types).join(',')
            const allCategoriesArr = Array.from(brandMap[brand].categories)

            const hasTarget = allCategoriesArr.some(c => targetCategories.some(t => t.toLowerCase() === c.toLowerCase()))

            if (!hasTarget) {
                if (!digiAlias[brandAcronym]) {
                    digiAlias[brandAcronym] = {
                        brand: brand,
                        type: types,
                        category: allCategoriesArr.join(',')
                    }
                    newAliases++
                }
            }

            brandMap[brand].categories.forEach(cat => {
                const isTarget = targetCategories.some(t => cat.toLowerCase() === t.toLowerCase())

                if (isTarget) {
                    const suffix = getCategorySuffix(cat)
                    const fullAlias = brandAcronym + suffix

                    if (!digiAlias[fullAlias]) {
                        digiAlias[fullAlias] = {
                            brand: brand,
                            type: types,
                            category: cat
                        }
                        newAliases++
                    }
                }
            })
        })

        if (newAliases > 0) saveDigiAlias()

        //console.log(`[DIGI] Sukses update! ${activeProducts.length} produk. (+${newAliases} alias baru)`)
        return { success: true, total: activeProducts.length, newAliases }
    } else {
        const rc = res.data?.rc || 'ERR'
        const msg = parseError(rc)
        console.log(`[DIGI] Gagal update produk: ${msg}`)
        return { success: false, message: msg }
    }
}

export const topupRequest = async (sku, dest, refId = null) => {
    const trxId = refId || generateRefId()

    const payload = {
        username: digiUser,
        buyer_sku_code: sku,
        customer_no: dest,
        ref_id: trxId,
        sign: sign('', trxId)
    }

    const res = await digiFetch('/transaction', payload)

    if (!res.data) res.data = {}
    res.data.ref_id_used = trxId

    if (res.data.rc) {
        res.data.human_message = parseError(res.data.rc)
    }
    return res
}

export const statusRequest = async (sku, dest, refId) => {
    return await topupRequest(sku, dest, refId)
}