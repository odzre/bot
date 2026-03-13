import { getUser, saveUsers } from '../lib/database.js'

export default {
    cmd: ['addrole', 'delrole'],
    category: 'owner',
    run: async (m, { text, args, command }) => {
        if (!m.isOwner) return m.adReply('Khusus Owner.')

        if (command === 'addrole') {
            let target = m.quoted ? m.quoted.sender : args[0]
            let role = m.quoted ? args[0] : args[1]
            
            if (!target || !role) return m.adReply('Format: .addrole 628xx gold\nAtau reply user ketik .addrole gold')
            
            target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            const targetUser = getUser(target)
            
            if (!targetUser) return m.adReply('User belum terdaftar di database.')
            if (!['silver', 'gold', 'premium'].includes(role.toLowerCase())) return m.adReply('Role tersedia: silver, gold, premium')
            
            targetUser.role = role.toLowerCase()
            saveUsers()
            return m.adReply(`✅ Berhasil ubah role @${target.split('@')[0]} menjadi *${role.toUpperCase()}*`, { mentions: [target] })
        }

        if (command === 'delrole') {
            let target = m.quoted ? m.quoted.sender : args[0]
            if (!target) return m.adReply('Format: .delrole 628xx\nAtau reply user.')
            
            target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            const targetUser = getUser(target)
            
            if (!targetUser) return m.adReply('User belum terdaftar.')
            
            targetUser.role = 'silver'
            saveUsers()
            return m.adReply(`✅ Role @${target.split('@')[0]} direset ke SILVER`, { mentions: [target] })
        }
    }
}