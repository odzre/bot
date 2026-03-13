import { updateGroupSettings, getGroupSettings } from '../lib/database.js'

export default {
    cmd: ['open', 'close', 'setopen', 'setclose'],
    category: 'admin',
    run: async (m, { sock, text, command }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya di dalam grup.')
        if (!m.isAdmin) return m.adReply('kamu bukan admin.')
        if (!m.isBotAdmin) return m.adReply('bot bukan admin.')

        const settings = getGroupSettings(m.from)

        if (command === 'open') {
            await sock.groupSettingUpdate(m.from, 'not_announcement')
            return m.adReply(settings.openMsg || 'Grup dibuka.')
        }

        if (command === 'close') {
            await sock.groupSettingUpdate(m.from, 'announcement')
            return m.adReply(settings.closeMsg || 'Grup ditutup.')
        }

        if (command === 'setopen') {
            if (!text || text === '-h') {
                return m.adReply('*tutorial setopen*\natur pesan saat grup dibuka.\n\ncontoh: .setopen grup sudah dibuka!')
            }
            updateGroupSettings(m.from, { openMsg: text })
            return m.adReply('pesan **open** berhasil diperbarui.')
        }

        if (command === 'setclose') {
            if (!text || text === '-h') {
                return m.adReply('*tutorial setclose*\natur pesan saat grup ditutup.\n\ncontoh: .setclose grup ditutup dulu ya!')
            }
            updateGroupSettings(m.from, { closeMsg: text })
            return m.adReply('pesan **close** berhasil diperbarui.')
        }
    }
}