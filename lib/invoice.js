import { createCanvas, loadImage, registerFont } from 'canvas'
import fs from 'fs'

const fontPath = './assets/font/Bold.ttf'
const imagePath = './assets/invoice.jpg'

if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'PoppinsBold' })
}

const getTime = () => {
    const date = new Date()
    return {
        date: date.toLocaleDateString('id-ID'),
        time: date.toLocaleTimeString('id-ID', { 
            timeZone: 'Asia/Jakarta', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        }).replace(/\./g, ':') + ' WIB'
    }
}

export const makeInvoice = async (data) => {
    const { refId, product, tujuan, nickname, sn } = data

    const image = await loadImage(imagePath)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#ffffff'
    ctx.font = '55px "PoppinsBold"'
    const { date, time } = getTime()
    
    ctx.fillText(date, 520, 680)   
    ctx.fillText(time, 810, 680)
    ctx.fillText(`#${refId}`, 1505, 680)
    ctx.font = '60px "PoppinsBold"'
    
    // Koordinat Body (X, Y)
    const formatText = (text, limit) => text.length > limit ? text.substring(0, limit) + '...' : text

    ctx.fillText(formatText(product, 35), 1050, 989)    // Produk
    ctx.fillText(tujuan, 1050, 1189)                    // Tujuan
    ctx.fillText(nickname || '-', 1050, 1407)           // Nickname
    ctx.fillText(formatText(sn || '-', 45), 1050, 1630) // SN

    return canvas.toBuffer('image/jpeg', { quality: 0.8 })
}