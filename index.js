import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import chalk from 'chalk'
import { loadPlugins, getPlugin, plugins } from './lib/plugins.js'
import { serialize, decodeJid } from './lib/serialize.js'
import wrapSocket, { groupCache } from './lib/helper.js'
import config from './config.js'
import { getUser, getGroupSettings, getListData, groupsDb, saveGroups } from './lib/database.js'
import { updateProducts } from './lib/digi.js'
import { CurrencyManager } from './lib/helper.js'
import { exec } from 'child_process'
import util from 'util'
//
const pluginState = new Map()

const startBot = async () => {
    await loadPlugins()

    fs.readdirSync('./plugins').forEach(file => {
        if (file.endsWith('.js')) {
            const content = fs.readFileSync(path.join('./plugins', file), 'utf8')
            pluginState.set(file, content.split('\n').length)
        }
    })

    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version } = await fetchLatestBaileysVersion()

    const logger = pino({ level: 'silent' })

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: !config.usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true
    })

    await wrapSocket(sock)

    setTimeout(() => {
        updateProducts().catch(e => console.error('[AUTO-UPDATE] Fail:', e))
    }, 10000)

    setTimeout(() => {
        CurrencyManager.fetchLatestRate().catch(e => console.error('[CURRENCY] Fail:', e))
    }, 5000)

    setInterval(() => {
        updateProducts().catch(e => console.error('[AUTO-UPDATE] Fail:', e))
    }, 5 * 60 * 1000)

    setInterval(() => {
        CurrencyManager.fetchLatestRate().catch(e => console.error('[CURRENCY] Fail:', e))
    }, 10 * 60 * 1000)

    if (config.usePairingCode && !sock.authState.creds.registered) {
        console.log(chalk.cyanBright('Menyiapkan Pairing Code...'))
        await new Promise(resolve => setTimeout(resolve, 2000))
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        console.log(chalk.yellowBright('Masukan Nomer Bot: '))
        const phoneNumber = await new Promise(resolve => rl.question('', resolve))
        rl.close()
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber.trim())
            console.log(chalk.black(chalk.bgCyanBright(` Pairing Code: ${code} `)))
        }, 3000)
    }

    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu
        const settings = getGroupSettings(id)

        try {
            const metadata = await sock.groupMetadata(id)
            groupsDb[id] = metadata
            saveGroups()
            groupCache.set(id, metadata)
        } catch (e) { }

        if (action === 'add' && !settings.welcome) return
        if (action === 'remove' && !settings.left) return
        if (action !== 'add' && action !== 'remove') return

        for (let user of participants) {
            try {
                let jid = decodeJid(user)
                let text = (action === 'add' ? settings.welcomeMsg : settings.leftMsg) || ''
                let picMatch = text.match(/@picture=(\S+)/)
                let picMode = picMatch ? picMatch[1] : 'auto'
                text = text.replace(/@picture=\S+/, '').trim()

                let ppUrl = config.thumbnail
                if (picMode === 'auto') {
                    try {
                        ppUrl = await sock.profilePictureUrl(jid, 'image')
                    } catch {
                        ppUrl = config.thumbnail
                    }
                } else {
                    ppUrl = picMode
                }

                const userDb = getUser(user)
                const pushName = userDb?.pushname || jid.split('@')[0]
                const now = new Date()
                const replacer = {
                    '@pushname': `@${jid.split('@')[0]}`,
                    '@nama': pushName,
                    '@gcname': groupCache.get(id)?.subject || 'Grup',
                    '@jam': now.toLocaleTimeString('id-ID'),
                    '@tanggal': now.toLocaleDateString('id-ID')
                }

                for (let key in replacer) {
                    text = text.replace(new RegExp(key, 'g'), replacer[key])
                }

                await sock.sendMessage(id, {
                    text: text,
                    contextInfo: {
                        externalAdReply: {
                            title: action === 'add' ? 'Welcome Member' : 'Goodbye Member',
                            body: config.botName,
                            mediaType: 1,
                            thumbnailUrl: ppUrl.startsWith('http') ? ppUrl : undefined,
                            thumbnail: !ppUrl.startsWith('http') ? (fs.existsSync(ppUrl) ? fs.readFileSync(ppUrl) : undefined) : undefined,
                            sourceUrl: config.sourceUrl,
                            renderLargerThumbnail: true
                        },
                        mentionedJid: [jid]
                    }
                })
            } catch (e) { }
        }
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log(chalk.greenBright.bold(`${config.botName} Connected !`))
        }
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason !== DisconnectReason.loggedOut) startBot()
        }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        let m = await serialize(sock, messages[0], config)
        if (!m || !m.message) return

        if (m.isGroup) {
            let meta = groupsDb[m.from] || groupCache.get(m.from)
            if (!meta) {
                try {
                    meta = await sock.groupMetadata(m.from)
                    groupsDb[m.from] = meta
                    saveGroups()
                    groupCache.set(m.from, meta)
                } catch (e) { }
            }

            if (meta) {
                const botNumber = decodeJid(sock.user.id).split('@')[0]
                const participant = meta.participants.find(p => p.id === m.senderLid || p.id === m.sender)
                m.isAdmin = participant ? (participant.admin !== null) : false

                const botParticipant = meta.participants.find(p => p.id.startsWith(botNumber) || (p.phoneNumber && p.phoneNumber.startsWith(botNumber)))
                m.isBotAdmin = botParticipant ? (botParticipant.admin !== null) : false
            }
        }

        const time = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })

        console.log(chalk.cyanBright('𓆝 𓆟 𓆞 𓆝 𓆟'))
        console.log(`[ ${m.isGroup ? chalk.yellowBright.bold('GC') : chalk.greenBright.bold('PC')} ] [ ${chalk.whiteBright(time + ' WIB')} ]`)
        if (m.isGroup) {
            console.log(`${chalk.magentaBright('›')} ${chalk.yellowBright('ID Grup:')} ${chalk.whiteBright(m.from)}`)
            console.log(`${chalk.magentaBright('›')} ${chalk.yellowBright('Subject:')} ${chalk.whiteBright.bold(groupsDb[m.from]?.subject || 'Loading...')}`)
        }
        console.log(`${chalk.magentaBright('›')} ${chalk.cyanBright(m.sender)} ${chalk.whiteBright('~')} ${chalk.blueBright(m.senderLid)}`)
        console.log(`${chalk.magentaBright('›')} ${chalk.greenBright.bold(m.pushName)} [${chalk.yellowBright(m.role)}]`)
        console.log(`${chalk.magentaBright('›')} ${chalk.magentaBright('Type:')} ${chalk.whiteBright(m.type)}`)
        console.log(`${chalk.magentaBright('›')} ${chalk.whiteBright('message:')} ${chalk.cyanBright(m.body || 'Media Content')}`)
        console.log(chalk.cyanBright('· · ─ ·𖥸· ─ · ·'))

        if (m.isGroup && m.body && !m.isAdmin && m.isBotAdmin) {
            const settings = getGroupSettings(m.from)
            const isGcLink = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i.test(m.body)
            const isAnyLink = /https?:\/\/[^\s]+/gi.test(m.body)

            if ((settings.antilinkgc && isGcLink) || (settings.antilinkall && isAnyLink)) {
                const mode = isGcLink ? settings.antilinkgc : settings.antilinkall
                if (mode) {
                    await sock.sendMessage(m.from, { delete: m.key })
                    if (mode === 'kick') {
                        await sock.groupParticipantsUpdate(m.from, [m.senderLid], 'remove')
                        m.reply(`@${m.sender.split('@')[0]} dikeluarkan karena mengirim link!`, { mentions: [m.sender] })
                    } else {
                        m.reply(`@${m.sender.split('@')[0]} dilarang mengirim link di grup ini!`, { mentions: [m.sender] })
                    }
                    return
                }
            }
        }

        if (m.isGroup && m.body) {
            const data = getListData(m.from)
            const keys = Object.keys(data.items).sort()
            let triggerContent = null

            if (data.items[m.body.toLowerCase()]) {
                triggerContent = data.items[m.body.toLowerCase()]
            }
            else if (m.quoted && keys.length > 0) {
                if (/^\d+$/.test(m.body)) {
                    const index = parseInt(m.body) - 1
                    if (keys[index]) triggerContent = data.items[keys[index]]
                }
            }

            if (triggerContent) {
                if (typeof triggerContent === 'object') {
                    if (triggerContent.image) {
                        return sock.sendMessage(m.from, {
                            image: { url: triggerContent.image },
                            caption: triggerContent.text
                        }, { quoted: m })
                    }
                    return m.adReply(triggerContent.text)
                }
                return m.adReply(triggerContent)
            }
        }

        if (m.isOwner && m.body) {
            if (m.body.startsWith('> ')) {
                try {
                    let evaled = await eval(m.body.slice(2))
                    if (typeof evaled !== 'string') evaled = util.inspect(evaled)
                    return await m.adReply(evaled)
                } catch (err) {
                    return await m.adReply(util.format(err))
                }
            }
            if (m.body.startsWith('$ ')) {
                exec(m.body.slice(2), (err, stdout) => {
                    if (err) return m.adReply(util.format(err))
                    if (stdout) return m.adReply(util.format(stdout))
                })
                return
            }
        }

        let isHandled = false
        for (const [name, plugin] of plugins.entries()) {
            if (plugin.before) {
                try {
                    const res = await plugin.before(m, { sock, config, text: m.body || '' })
                    if (res) isHandled = true
                } catch (e) {
                    console.error(chalk.red(`Error in before hook of ${name}:`), e)
                }
            }
        }
        if (isHandled) return

        const prefix = (m.body && /^[./!#]/.test(m.body)) ? m.body[0] : ''
        const command = (m.body && m.body.startsWith(prefix)) ? m.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : ''
        const args = m.body ? m.body.trim().split(/ +/).slice(1) : []
        const text = args.join(' ')

        const plugin = getPlugin(command)
        if (plugin) {
            try {
                await plugin.run(m, { sock, config, text, args, command })
            } catch (e) {
                console.error(chalk.red(e))
            }
        }
    })
}

startBot()

let watchLock = false
fs.watch('./plugins', async (eventType, filename) => {
    if (filename && filename.endsWith('.js') && !watchLock) {
        watchLock = true
        setTimeout(async () => {
            const filePath = path.join('./plugins', filename)
            if (fs.existsSync(filePath)) {
                const newContent = fs.readFileSync(filePath, 'utf8')
                const newLines = newContent.split('\n').length
                const oldLines = pluginState.get(filename) || newLines
                const diff = newLines - oldLines
                const logChar = diff >= 0 ? chalk.green(`+${diff}`) : chalk.red(`${diff}`)
                console.log(chalk.yellow(`[UPDATE] `) + chalk.cyan(filename) + ` (${logChar} lines)`)
                pluginState.set(filename, newLines)
                await loadPlugins()
            }
            watchLock = false
        }, 500)
    }
})
