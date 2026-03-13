import { checkGameId, checkDoubleML, gameList } from '../lib/cekid.js'

const gameCommands = Object.keys(gameList).map(key => 'cek' + key)

export default {
    cmd: ['cekid', 'cekganda', ...gameCommands],
    category: 'tools',
    run: async (m, { text, args, command }) => {
        
        if (command === 'cekganda') {
            const id = args[0]
            const zone = args[1]

            if (!id || !zone) return m.reply('⚠️ Format Salah\n\nContoh: .cekganda 12345678 1234')

            m.reply('🔍 Mengecek Data MLBB...')

            const res = await checkDoubleML(id, zone)

            if (!res.status) return m.reply(`❌ Gagal: ${res.message}`)

            const d = res.data
            
            let msg = `*✅ ID DITEMUKAN*\n\n`
            msg += `*› Nick:* ${d.nickname}\n`
            msg += `*› ID:* ${d.id}\n`
            msg += `*› Zone:* ${d.zone}\n`
            msg += `*› Region:* ${d.flag} ${d.region}\n`
            
            msg += `Weekly Diamond Pass ${d.weeklyStatus}\n\n`
            
            if (d.firstRecharge.length > 0) {
                msg += `*First Recharge:*\n`
                msg += d.firstRecharge.join('\n')
            }

            return m.reply(msg)
        }

        if (command === 'cekid') {
            let msg = `*LIST GAME*\n`
            msg += `_Ketik langsung command di bawah ini:_\n\n`
            
            msg += `*.cekganda* (Cek Region + Limit MLBB)\n\n`

            Object.keys(gameList).forEach((key, index) => {
                const game = gameList[key]
                msg += `${index + 1}. *.cek${key}* (${game.name})\n`
            })
            msg += `\n*Contoh:* .cekml1 123456 1234`
            return m.reply(msg)
        }

        const gameCode = command.slice(3) 
        if (!gameList[gameCode]) return m.reply('❌ Game tidak ditemukan.')

        const game = gameList[gameCode]
        const id = args[0]
        const zone = args[1] || ''

        if (!id) {
            let example = `.cek${gameCode} 123456`
            if (game.hasZone) example += ` 1234`
            return m.reply(`⚠️ *Format Salah*\n\nGame: ${game.name}\n✅ Ketik: *${example}*`)
        }

        if (game.hasZone && !zone) {
             return m.reply(`⚠️ *Kurang Zone ID*\n\nGame: ${game.name}\n✅ Contoh: *.cek${gameCode} ${id} 1234*`)
        }

        m.reply(`🔍 Mengecek ID *${id}*...`)

        const res = await checkGameId(gameCode, id, zone)

        if (!res.status) {
            return m.reply(`❌ *GAGAL*\n${res.message}`)
        }

        const { nickname, id: userId, zone: zoneId, region } = res.data

        let hasil = `*✅ ID DITEMUKAN*\n\n`
        hasil += `*› Nick:* ${nickname}\n`
        hasil += `*› ID:* ${userId}\n`
        if (zoneId !== '-') hasil += `*› Zone:* ${zoneId}\n`
        if (region && region !== '-') hasil += `*› Region:* ${region}\n`
        
        m.reply(hasil)
    }
}