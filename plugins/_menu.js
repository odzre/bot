import { plugins } from '../lib/plugins.js'
import { getUser } from '../lib/database.js'

export default {
    cmd: ['menu', 'help', 'allmenu'],
    category: 'main',
    run: async (m, { config, command, text }) => {
        const user = getUser(m.sender)
        const saldo = user ? user.saldo.toLocaleString('id-ID') : '0'
        const role = user ? user.role.toUpperCase() : 'USER'
        
        if (command === 'menu' || command === 'help') {
            let msg = `Hallo Kak @${m.sender.split('@')[0]}\n`
            msg += `Saya *${config.botName}* Siap untuk membantu kamu untuk bertransaksi\n\n`
            
            msg += `⌗ *User:* @${m.sender.split('@')[0]}\n`
            msg += `⌗ *No. WhatsApp:* ${m.sender.split('@')[0]}\n`
            msg += `⌗ *Balance:* Rp ${saldo}\n`
            msg += `⌗ *Role:* ${role}\n\n`

            msg += `*INFORMASI 🔍*\n`
            msg += `> » .depo \`(Deposit Otomatis)\`\n`
            msg += `> » .me \`(Profile User)\`\n`
            msg += `> » .cekid \`(List Cek ID Game)\`\n\n`

            msg += `*LAYANAN MENU TOP UP⚡*\n`
            msg += `> » .produk \`(Daftar Layanan)\`\n`
            msg += `> » .list \`(Layanan Grup)\`\n`
            msg += `> » .get \`(Daftar Harga)\`\n`
            msg += `> » .order \`(Order Otomatis)\`\n`
            msg += `> » .orderqr \`(Order Otomatis)\`\n\n`

            msg += `*MENU LAINNYA 🔁*\n`
            msg += `> » .allmenu \`(Semua daftar fitur)\``

            return m.adReply(msg, { renderLargerThumbnail: true, mentions: [m.sender] })
        }

        if (command === 'allmenu') {
            let categories = {}
            plugins.forEach((p) => {
                const cat = p.category ? p.category.toUpperCase() : 'UNKNOWN'
                if (!categories[cat]) categories[cat] = []
                p.cmd.forEach(c => {
                    categories[cat].push(c)
                })
            })

            const sortedCats = Object.keys(categories).sort()
            let body = `📚 *Daftar Semua Menu*\n\n`
            
            sortedCats.forEach(cat => {
                body += `› *${cat}* (${categories[cat].length})\n`
                categories[cat].sort().forEach(c => body += `.${c}\n`)
                body += `\n`
            })

            return m.adReply(body, { renderLargerThumbnail: true, mentions: [m.sender] })
        }
    }
}