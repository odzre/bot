import { marginDb, saveMargin } from '../lib/database.js'

export default {
    cmd: ['setmargin', 'setnominal'],
    category: 'owner',
    run: async (m, { args, command }) => {
        if (!m.isOwner) return m.adReply('Khusus Owner.')

        if (command === 'setmargin') {
            if (args.length < 3) return m.adReply('Format: .setmargin [silver] [gold] [premium] (dalam persen)\nContoh: .setmargin 5 2 1')
            
            marginDb.silver.percent = parseFloat(args[0])
            marginDb.gold.percent = parseFloat(args[1])
            marginDb.premium.percent = parseFloat(args[2])
            saveMargin()
            
            return m.adReply(`✅ Margin Persen Update!\nSilver: ${args[0]}%\nGold: ${args[1]}%\nPremium: ${args[2]}%`)
        }

        if (command === 'setnominal') {
            if (args.length < 3) return m.adReply('Format: .setnominal [silver] [gold] [premium] (dalam rupiah)\nContoh: .setnominal 500 200 0')
            
            marginDb.silver.flat = parseInt(args[0])
            marginDb.gold.flat = parseInt(args[1])
            marginDb.premium.flat = parseInt(args[2])
            saveMargin()
            
            return m.adReply(`✅ Margin Nominal Update!\nSilver: Rp ${args[0]}\nGold: Rp ${args[1]}\nPremium: Rp ${args[2]}`)
        }
    }
}