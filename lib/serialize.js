import { jidDecode, getContentType } from '@whiskeysockets/baileys'
import { saveUser, getUser } from './database.js'
import fs from 'fs'

export const decodeJid = (jid) => {
    if (!jid) return jid
    if (typeof jid !== 'string') return jid.id || jid.jid || jid
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return decode.user && decode.server && decode.user + '@' + decode.server || jid
    } else return jid
}

export const serialize = async (sock, m, config) => {
    if (!m) return m
    if (m.key) {
        m.id = m.key.id
        m.from = m.key.remoteJid
        m.isGroup = m.from.endsWith('@g.us')
        m.pushName = m.pushName || 'No Name'
        
        let lid = m.isGroup ? m.key.participant : m.key.remoteJid
        let jid = m.isGroup ? m.key.participantAlt : m.key.remoteJidAlt
        
        if (lid && lid.includes(':')) lid = decodeJid(lid)
        if (jid && jid.includes(':')) jid = decodeJid(jid)

        if (lid && jid && !jid.endsWith('@lid')) {
            saveUser(m.pushName, jid, lid)
        }

        const userDb = getUser(lid)
        m.senderLid = lid
        m.sender = (jid && !jid.endsWith('@lid')) ? jid : (userDb?.jid || lid)
        m.role = userDb?.role || 'silver'
        m.saldo = userDb?.saldo || 0
        
        const owners = config.ownerNumber.map(v => v.replace(/[^0-9]/g, ''))
        m.isOwner = m.sender ? owners.some(v => m.sender.startsWith(v)) : false
    }

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = (m.type === 'viewOnceMessageV2') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]
        m.body = m.message?.conversation || m.msg?.caption || m.msg?.text || (m.type === 'extendedTextMessage' && m.msg?.text) || ''
        m.text = m.body

        const quoted = m.msg?.contextInfo?.quotedMessage
        if (quoted) {
            m.quoted = {}
            m.quoted.message = quoted
            m.quoted.type = getContentType(quoted)
            m.quoted.msg = m.quoted.message[m.quoted.type]
            m.quoted.id = m.msg.contextInfo.stanzaId
            
            let qLid = m.msg.contextInfo.participant
            let qJid = m.msg.contextInfo.participantAlt
            
            if (qLid && qLid.includes(':')) qLid = decodeJid(qLid)
            if (qJid && qJid.includes(':')) qJid = decodeJid(qJid)

            const quotedUser = getUser(qLid)
            m.quoted.senderLid = qLid
            m.quoted.sender = (qJid && !qJid.endsWith('@lid')) ? qJid : (quotedUser?.jid || qLid)
            m.quoted.from = m.from
            m.quoted.isGroup = m.from.endsWith('@g.us')
            m.quoted.body = m.quoted.message?.conversation || m.quoted.msg?.caption || m.quoted.msg?.text || (m.quoted.type === 'extendedTextMessage' && m.quoted.msg?.text) || ''
            m.quoted.text = m.quoted.body
            const owners = config.ownerNumber.map(v => v.replace(/[^0-9]/g, ''))
            m.quoted.isOwner = m.quoted.sender ? owners.some(v => m.quoted.sender.startsWith(v)) : false
            m.quoted.download = () => sock.downloadMedia(m.quoted.message)
            m.quoted.delete = () => sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.quoted.id, participant: m.quoted.senderLid } })
        }
    }

    m.reply = (text, options = {}) => sock.sendMessage(m.from, { 
        text: text, 
        contextInfo: { 
            mentionedJid: options.mentions || [],
            remoteJid: m.from 
        } 
    }, { quoted: m })

    m.adReply = async (text, options = {}) => {
        let thumb = options.thumbnail || config.thumbnail
        const adContent = {
            title: options.title || config.title,
            body: options.body || config.body,
            mediaType: 1,
            sourceUrl: options.sourceUrl || config.sourceUrl,
            renderLargerThumbnail: options.renderLargerThumbnail || false
        }
        
        if (typeof thumb === 'string') {
            if (/^(https?:\/\/)/.test(thumb)) adContent.thumbnailUrl = thumb
            else adContent.thumbnail = fs.existsSync(thumb) ? fs.readFileSync(thumb) : Buffer.alloc(0)
        } else if (Buffer.isBuffer(thumb)) {
            adContent.thumbnail = thumb
        }

        return sock.sendMessage(m.from, { 
            text: text, 
            contextInfo: { 
                externalAdReply: adContent, 
                mentionedJid: options.mentions || [] 
            } 
        }, { quoted: m })
    }

    return m
}