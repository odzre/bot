import { CurrencyManager, formatCurrency } from '../lib/helper.js'

export default {
    cmd: ['cv'],
    category: 'user',
    run: async (m, { args }) => {
        if (args.length === 0) {
            let msg = `*Format salah!*\n\n`
            msg += `*Contoh penggunaan:*\n`
            msg += `.cv idrtomyr\n`
            msg += `.cv 10 usdtomyr\n`
            msg += `.cv 50 myrtoidr`
            return m.reply(msg)
        }

        let amount = 1
        let textArgs = args.join('').toLowerCase()

        let match = textArgs.match(/^([\d.,]+)/)
        if (match) {
            amount = parseFloat(match[1].replace(/,/g, ''))
            textArgs = textArgs.replace(match[1], '')
        }

        if (!textArgs.includes('to')) {
            return m.reply('Format mata uang tidak valid. Gunakan format seperti *idrtomyr* atau *usdtoidr*.')
        }

        const parts = textArgs.split('to')
        let fromCur = parts[0].toUpperCase().trim()
        let toCur = parts[parts.length - 1].toUpperCase().trim()

        if (parts.length > 2) {
            fromCur = parts.slice(0, parts.length - 1).join('TO').toUpperCase().trim()
        }

        const rates = CurrencyManager.getRates() || {}
        rates['IDR'] = 1

        const fromValid = rates[fromCur] !== undefined
        const toValid = rates[toCur] !== undefined

        if (!fromValid) return m.reply(`Mata uang asal *${fromCur}* tidak didukung.`)
        if (!toValid) return m.reply(`Mata uang tujuan *${toCur}* tidak didukung.`)

        if (isNaN(amount) || amount <= 0) amount = 1

        let amountIdr = amount
        if (fromCur !== 'IDR') {
            amountIdr = amount * rates[fromCur]
        }

        const strFrom = formatCurrency(amountIdr, fromCur, rates)
        const strTo = formatCurrency(amountIdr, toCur, rates)

        let msg = `💱 *CURRENCY CONVERTER*\n\n`
        msg += `*${fromCur} ➔ ${toCur}*\n`
        msg += `> ${strFrom}  =  ${strTo}`

        return m.reply(msg)
    }
}
