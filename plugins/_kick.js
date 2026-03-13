export default {
    cmd: ['kick'],
    category: 'admin',
    run: async (m, { sock }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya di dalam grup.')
        if (!m.isAdmin) return m.adReply('kamu bukan admin.')
        if (!m.isBotAdmin) return m.adReply('bot bukan admin.')

        let users = m.msg?.contextInfo?.mentionedJid || []
        if (m.quoted) users.push(m.quoted.sender)
        users = [...new Set(users)].filter(v => v !== sock.user.id.split(':')[0] + '@s.whatsapp.net')

        if (users.length === 0) return m.adReply('tag atau reply orangnya.')

        for (let jid of users) {
            await sock.groupParticipantsUpdate(m.from, [jid], 'remove')
        }

        const mentions = users.map(jid => `@${jid.split('@')[0]}`).join(' ')
        return m.adReply(`berhasil mengeluarkan ${mentions}`, { mentions: users })
    }
}