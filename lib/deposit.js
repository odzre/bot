import QRCode from 'qrcode'
import config from '../config.js'

const MUTASI_URL = 'https://odzre.my.id/api/orderkuota/get-mutasi'

export const createDeposit = async (amount) => {
    try {
        const finalAmount = parseInt(amount)
        let fee = 0
        
        if (finalAmount > 499999) {
            fee = Math.ceil(finalAmount * 0.007)
        }

        const uniqueCode = Math.floor(Math.random() * 99) + 1
        const totalToPay = finalAmount + fee + uniqueCode

        if (!config.qris) {
            return { success: false, message: 'Owner belum mengatur String QRIS di config.js' }
        }

        const qrBuffer = await QRCode.toBuffer(config.qris, {
            scale: 8,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        })

        return {
            success: true,
            data: {
                buffer: qrBuffer,
                refId: totalToPay, 
                amount: totalToPay,
                originalAmount: finalAmount,
                fee: fee,
                uniqueCode: uniqueCode,
                qrString: config.qris
            }
        }
    } catch (e) {
        return { success: false, message: e.message }
    }
}

export const checkDepositStatus = async (refId) => {
    try {
        const targetAmount = parseInt(refId) 
        const formattedAmount = targetAmount.toLocaleString('id-ID').replace(/,/g, '.')

        const params = new URLSearchParams({
            apikey: 'freeApikey',
            username: config.orderKuotaUserName,
            token: config.orderKuotaToken
        })

        const req = await fetch(`${MUTASI_URL}?${params.toString()}`)
        const res = await req.json()

        if (!res.result || !Array.isArray(res.result)) {
            return { status: 'pending' }
        }

        const found = res.result.find(trx => {
            return trx.kredit === formattedAmount && trx.status === 'IN'
        })

        if (found) {
            return {
                data: {
                    status: 'paid',
                    details: found
                }
            }
        }

        return { status: 'pending' }
        
    } catch (e) {
        return { status: 'error' }
    }
}