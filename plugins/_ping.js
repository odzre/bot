export default {
    cmd: ['ping'],
    category: 'info',
    run: async (m, { sock, config }) => {
        const timestamp = m.messageTimestamp * 1000
        const latency = Date.now() - timestamp
        
        await m.adReply(`Pong! 🏓\n${latency}ms`)
    }
}