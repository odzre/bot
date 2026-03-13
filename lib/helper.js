import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import axios from 'axios'
import fs from 'fs'
import { PassThrough, Readable } from 'stream'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import WebP from 'node-webpmux'

ffmpeg.setFfmpegPath(ffmpegPath)

export const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })

const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
        stream.on('error', (err) => reject(err))
    })
}

export default async function wrapSocket(sock) {
    sock.downloadMedia = async (message) => {
        let type = Object.keys(message)[0]
        let m = message[type]
        if (type === 'buttonsMessage' || type === 'viewOnceMessageV2') {
            type = Object.keys(m.message)[0]
            m = m.message[type]
        }
        const stream = await downloadContentFromMessage(m, type.replace('Message', ''))
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
        return buffer
    }

    sock.getFile = async (PATH) => {
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? Buffer.from(await (await fetch(PATH)).arrayBuffer()) : fs.existsSync(PATH) ? fs.readFileSync(PATH) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        return { data }
    }

    sock.sendImage = async (jid, path, caption = '', quoted = '', options = {}) => {
        const { data } = await sock.getFile(path)
        return sock.sendMessage(jid, { image: data, caption, ...options }, { quoted })
    }

    sock.sendVideo = async (jid, path, caption = '', quoted = '', options = {}) => {
        const { data } = await sock.getFile(path)
        return sock.sendMessage(jid, { video: data, caption, ...options }, { quoted })
    }

    sock.sendAudio = async (jid, path, ptt = false, quoted = '', options = {}) => {
        const { data } = await sock.getFile(path)
        if (ptt) {
            const out = new PassThrough()
            ffmpeg(Readable.from(data))
                .noVideo()
                .audioCodec('libopus')
                .audioChannels(1)
                .audioFrequency(48000)
                .toFormat('ogg')
                .addOutputOptions(['-avoid_negative_ts make_zero'])
                .on('error', (err) => { console.error('FFmpeg Error:', err) })
                .pipe(out)

            const buffer = await streamToBuffer(out)
            return await sock.sendMessage(jid, { audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus', ...options }, { quoted })
        }
        return await sock.sendMessage(jid, { audio: data, ptt: false, mimetype: 'audio/mpeg', ...options }, { quoted })
    }

    sock.sendSticker = async (jid, path, quoted = '', options = {}) => {
        const { data } = await sock.getFile(path)
        const packname = options.packname || 'Yuuki Sorimachi'
        const author = options.author || '@6283143776050'

        const out = new PassThrough()
        ffmpeg(Readable.from(data))
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(512,iw)':'min(512,ih)',pad=512:512:(512-iw)/2:(512-ih)/2:color=white@0",
                "-lossless", "1", "-loop", "0", "-preset", "default", "-an", "-vsync", "0"
            ])
            .toFormat('webp')
            .on('error', (err) => { console.error('FFmpeg Sticker Error:', err) })
            .pipe(out)

        let buffer = await streamToBuffer(out)
        const img = new WebP.Image()
        const json = { "sticker-pack-id": `yuuki-${Date.now()}`, "sticker-pack-name": packname, "sticker-pack-publisher": author, "emojis": ["🚀"] }
        const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
        const exif = Buffer.concat([exifHeader, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)

        await img.load(buffer)
        img.exif = exif
        buffer = await img.save(null)

        return sock.sendMessage(jid, { sticker: buffer, ...options }, { quoted })
    }

    return sock
}

// --- CURRENCY UTILS ---
export function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

export function convertCurrency(amountIDR, activeCurrency, rates) {
    if (activeCurrency === 'IDR' || !rates[activeCurrency]) return amountIDR;
    return amountIDR / rates[activeCurrency];
}

export function formatCurrency(amountIDR, activeCurrency, rates) {
    const converted = convertCurrency(amountIDR, activeCurrency, rates);

    if (activeCurrency === 'IDR' || !rates[activeCurrency]) {
        return formatRupiah(amountIDR);
    }

    const symbolMap = {
        'MYR': 'RM',
        'USD': '$',
        'SGD': 'S$',
        'JPY': '¥'
    };

    const symbol = symbolMap[activeCurrency] || activeCurrency;

    if (activeCurrency === 'JPY') {
        const rounded = Math.round(converted);
        return `${symbol} ${rounded.toLocaleString('id-ID')}`;
    }

    return `${symbol} ${converted.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateRefId() {
    return 'TRX-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class CurrencyManager {
    static getRates() {
        try {
            const data = JSON.parse(fs.readFileSync('./database/curncy.json'))
            return data.currency ? data.currency.rates : data.rates
        } catch (e) {
            return { IDR: 1 }
        }
    }

    static async fetchLatestRate() {
        try {
            const bases = ['USD', 'MYR', 'SGD', 'JPY'];
            let settingData = {}
            try {
                settingData = JSON.parse(fs.readFileSync('./database/curncy.json'))
            } catch (e) { }

            if (!settingData.currency) {
                settingData.currency = { rates: settingData.rates || {}, last_update: null };
            }

            let updatedCount = 0;

            for (const base of bases) {
                try {
                    const response = await axios.get(`https://open.er-api.com/v6/latest/${base}`);
                    if (response.data && response.data.rates && response.data.rates.IDR) {
                        const idrRate = response.data.rates.IDR;
                        settingData.currency.rates[base] = idrRate;
                        updatedCount++;
                        console.log(`[CURRENCY] Update Sukses: 1 ${base} = Rp ${idrRate}`);
                    }
                } catch (err) {
                    console.error(`[CURRENCY] Gagal mengambil rate untuk ${base}:`, err.message);
                }
            }

            if (updatedCount > 0) {
                settingData.currency.last_update = new Date().toISOString();
                fs.writeFileSync('./database/curncy.json', JSON.stringify(settingData, null, 2));
                return settingData.currency.rates;
            }
        } catch (error) {
            console.error("[CURRENCY] Gagal mengambil rate terbaru:", error.message);
        }
        return null;
    }

    static startAutoUpdate(intervalHours = 1) {
        this.fetchLatestRate();
        const ms = intervalHours * 60 * 60 * 1000;
        setInterval(() => {
            this.fetchLatestRate();
        }, ms);
    }
}

export const parseCurrencyInput = (inputStr, defaultCurrency = 'IDR') => {
    let str = typeof inputStr === 'string' ? inputStr.toUpperCase().replace(/\s+/g, '') : String(inputStr)
    let currency = defaultCurrency
    let amountStr = str

    if (str.endsWith('RM') || str.endsWith('MYR')) {
        currency = 'MYR'
        amountStr = str.replace(/RM|MYR/g, '')
    } else if (str.endsWith('USD') || str.endsWith('$')) {
        currency = 'USD'
        amountStr = str.replace(/USD|\$/g, '')
    } else if (str.endsWith('IDR') || str.endsWith('RP')) {
        currency = 'IDR'
        amountStr = str.replace(/IDR|RP/g, '')
    } else if (str.startsWith('RM') || str.startsWith('MYR') || str.startsWith('USD') || str.startsWith('$') || str.startsWith('IDR') || str.startsWith('RP')) {
        if (str.startsWith('RM')) { currency = 'MYR'; amountStr = str.replace(/^RM/, ''); }
        else if (str.startsWith('MYR')) { currency = 'MYR'; amountStr = str.replace(/^MYR/, ''); }
        else if (str.startsWith('USD')) { currency = 'USD'; amountStr = str.replace(/^USD/, ''); }
        else if (str.startsWith('$')) { currency = 'USD'; amountStr = str.replace(/^\$/, ''); }
        else if (str.startsWith('IDR')) { currency = 'IDR'; amountStr = str.replace(/^IDR/, ''); }
        else if (str.startsWith('RP')) { currency = 'IDR'; amountStr = str.replace(/^RP/, ''); }
    }

    const value = parseFloat(amountStr) || 0
    return { value, currency }
}

export const convertToIdr = (amount, currency = 'IDR', rates) => {
    if (currency === 'IDR' || !rates || !rates[currency]) return amount
    return Math.round(amount * rates[currency])
}