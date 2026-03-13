import { updateGroupSettings, getGroupSettings } from '../lib/database.js'

export default {
    cmd: ['antilinkgc', 'antilinkall'],
    category: 'admin',
    run: async (m, { text, args, command }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya di dalam grup.')
        if (!m.isAdmin) return m.adReply('kamu bukan admin.')

        const settings = getGroupSettings(m.from)
        const type = command === 'antilinkgc' ? 'antilinkgc' : 'antilinkall'
        const label = command === 'antilinkgc' ? 'Antilink Group' : 'Antilink All'

        if (args[0] === 'on') {
            let mode = 'delete'
            if (args.includes('-kick')) mode = 'kick'
            
            updateGroupSettings(m.from, { [type]: mode })
            return m.adReply(`${label} berhasil diaktifkan dengan mode: *${mode}*`)
        } else if (args[0] === 'off') {
            updateGroupSettings(m.from, { [type]: false })
            return m.adReply(`${label} berhasil dimatikan.`)
        } else {
            return m.adReply(`*Cara Penggunaan ${label}*\n\n` +
                `• .${command} on -delete (hapus pesan)\n` +
                `• .${command} on -kick (hapus & kick)\n` +
                `• .${command} off (matikan)\n\n` +
                `*Status saat ini:* ${settings[type] ? 'ON (' + settings[type] + ')' : 'OFF'}`)
        }
    }
}