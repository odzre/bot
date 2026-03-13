import { digiDb, digiAlias, saveDigiAlias } from '../lib/database.js'

export default {
    cmd: ['addalias', 'delalias', 'upalias'],
    category: 'owner',
    run: async (m, { text, command }) => {
        if (!m.isOwner) return m.adReply('Khusus Owner.')

        if (command === 'addalias') {
            let alias, brand, type
            if (text.includes('|')) {
                const parts = text.split('|').map(x => x.trim())
                alias = parts[0]
                brand = parts[1]
                type = parts[2]
            } else {
                return m.adReply(`❌ *Format Salah*\nFormat: .addalias alias | brand | type\n\nContoh: .addalias mlg | Mobile Legends | Umum,Global`)
            }

            if (!alias || !brand || !type) return m.adReply('Data tidak lengkap.')
            if (digiAlias[alias.toLowerCase()]) return m.adReply('Alias sudah ada! Gunakan .upalias untuk edit.')

            const foundProduct = digiDb.find(p => p.brand.toLowerCase() === brand.toLowerCase())
            let autoCategory = foundProduct ? foundProduct.category : 'All'

            digiAlias[alias.toLowerCase()] = { brand, type, category: autoCategory }
            saveDigiAlias()
            return m.adReply(`✅ Alias *${alias}* berhasil ditambahkan!\nBrand: ${brand}\nKategori: ${autoCategory}`)
        }

        if (command === 'upalias') {
            let alias, brand, type
            if (text.includes('|')) {
                const parts = text.split('|').map(x => x.trim())
                alias = parts[0]
                brand = parts[1]
                type = parts[2]
            } else {
                return m.adReply(`❌ *Format Salah*\nFormat: .upalias alias | brand | type`)
            }
            if (!alias || !brand || !type) return m.adReply('Data tidak lengkap.')
            if (!digiAlias[alias.toLowerCase()]) return m.adReply('Alias belum ada! Gunakan .addalias untuk tambah baru.')

            const foundProduct = digiDb.find(p => p.brand.toLowerCase() === brand.toLowerCase())
            let autoCategory = foundProduct ? foundProduct.category : 'All'

            digiAlias[alias.toLowerCase()] = { brand, type, category: autoCategory }
            saveDigiAlias()
            return m.adReply(`✅ Alias *${alias}* berhasil diupdate!`)
        }

        if (command === 'delalias') {
            if (!text) return m.adReply('Masukan nama alias.')
            if (digiAlias[text.toLowerCase()]) {
                delete digiAlias[text.toLowerCase()]
                saveDigiAlias()
                return m.adReply(`✅ Alias *${text}* dihapus.`)
            }
            return m.adReply('Alias tidak ditemukan.')
        }
    }
}