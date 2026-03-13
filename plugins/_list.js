import { getListData, saveList } from '../lib/database.js'
import { groupCache } from '../lib/helper.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
    cmd: ['list', 'setlist', 'addlist', 'dellist', 'uplist'],
    category: 'group',
    run: async (m, { sock, text, command }) => {
        if (!m.isGroup) return m.adReply('fitur ini hanya dapat digunakan di dalam grup.')

        const data = getListData(m.from)
        let meta = groupCache.get(m.from)
        let groupName = meta?.subject

        if (!groupName) {
            try {
                const fetchedMeta = await sock.groupMetadata(m.from)
                groupName = fetchedMeta.subject
                groupCache.set(m.from, fetchedMeta)
            } catch (e) {
                groupName = 'Grup'
            }
        }

        if (command === 'setlist') {
            if (!m.isAdmin) return m.adReply('hanya admin yang bisa menggunakan perintah ini.')
            if (!text || text === '-h') {
                return m.adReply(`*tutorial set list*\n\natur tampilan pesan saat perintah .list diketik.\n\n*variabel tersedia:*\n• *@user* : tag orang yang mengetik\n• *@groupname* : nama grup\n• *@list* : daftar list berformat (│ׄ ☕︎  Nama List)\n• *@jam* : jam terkini wib\n• *@tanggal* : dd/mm/yyyy\n\n*contoh:*\n.setlist Halo @user, berikut daftar menu di @groupname:\n@list\n\n@jam @tanggal`)
            }
            data.template = text
            saveList()
            return m.adReply('template **list** berhasil diperbarui.')
        }

        const uploadToCDN = async (buffer) => {
            try {
                const blob = new Blob([buffer], { type: 'image/jpeg' })
                const formData = new FormData()
                formData.append('file', blob, 'image.jpg')

                const res = await fetch('https://cdn.odzre.my.id/upload', {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                return json.url
            } catch (err) {
                console.error(err)
                return null
            }
        }

        if (command === 'addlist') {
            if (!m.isAdmin) return m.adReply('hanya admin yang bisa menggunakan perintah ini.')
            if (!text || text === '-h') {
                return m.adReply(`*tutorial add list*\n\ntambah item baru ke dalam list. Support nama dengan spasi dan gambar!\n\n*Cara 1 (Reply Pesan/Gambar):*\nReply pesan orang lain lalu ketik:\n.addlist Nama List\n\n*Cara 2 (Manual Tanpa Reply):*\n.addlist Nama List | Isi List`)
            }

            let name = ''
            let content = ''

            if (m.quoted && !text.includes('|')) {
                name = text.trim()
                content = m.quoted.text || ''
            } else if (text.includes('|')) {
                const split = text.split('|')
                name = split[0].trim()
                content = split.slice(1).join('|').trim()
            } else {
                return m.adReply('Format salah! Gunakan: *.addlist nama | isi* ATAU reply pesan dengan *.addlist nama*')
            }

            if (!name) return m.adReply('Nama list tidak boleh kosong!')

            let imageUrl = null
            const isImage = m.type === 'imageMessage' || m.quoted?.type === 'imageMessage'

            if (isImage) {
                try {
                    const targetMsg = (m.type === 'imageMessage') ? m.msg : m.quoted.msg
                    const stream = await downloadContentFromMessage(targetMsg, 'image')
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }

                    imageUrl = await uploadToCDN(buffer)
                    if (!imageUrl) return m.adReply('Gagal mengunggah gambar ke CDN, coba lagi nanti.')

                } catch (e) {
                    return m.adReply('Gagal memproses gambar.')
                }
            }

            data.items[name.toLowerCase()] = imageUrl ? { text: content, image: imageUrl } : content
            saveList()
            return m.adReply(`Berhasil menambah list: *${name}*`)
        }

        if (command === 'uplist') {
            if (!m.isAdmin) return m.adReply('hanya admin yang bisa menggunakan perintah ini.')
            if (!text || text === '-h') {
                return m.adReply(`*tutorial update list*\n\nmengubah isi/gambar list yang sudah ada.\n\n*format:* .uplist nama | isi baru\nAtau reply gambar/pesan dengan: .uplist nama`)
            }

            let name = ''
            let content = ''

            if (m.quoted && !text.includes('|')) {
                name = text.trim()
                content = m.quoted.text || ''
            } else if (text.includes('|')) {
                const split = text.split('|')
                name = split[0].trim()
                content = split.slice(1).join('|').trim()
            } else {
                return m.adReply('Format salah! Gunakan: *.uplist nama | isi baru* ATAU reply pesan dengan *.uplist nama*')
            }

            const key = name.toLowerCase()
            if (!data.items[key]) return m.adReply(`Nama list *${name}* tidak ditemukan.`)

            let imageUrl = null
            const isImage = m.type === 'imageMessage' || m.quoted?.type === 'imageMessage'

            if (isImage) {
                try {
                    const targetMsg = (m.type === 'imageMessage') ? m.msg : m.quoted.msg
                    const stream = await downloadContentFromMessage(targetMsg, 'image')
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }

                    imageUrl = await uploadToCDN(buffer)
                    if (!imageUrl) return m.adReply('Gagal mengunggah gambar ke CDN, coba lagi nanti.')

                } catch (e) {
                    return m.adReply('Gagal memproses gambar baru.')
                }
            } else {
                if (typeof data.items[key] === 'object' && data.items[key].image) {
                    imageUrl = data.items[key].image
                }
            }

            data.items[key] = imageUrl ? { text: content, image: imageUrl } : content
            saveList()
            return m.adReply(`Berhasil memperbarui isi list: *${name}*`)
        }

        if (command === 'dellist') {
            if (!m.isAdmin) return m.adReply('hanya admin yang bisa menggunakan perintah ini.')
            if (!text || text === '-h') {
                return m.adReply(`*tutorial delete list*\n\nmenghapus item list yang sudah ada.\n\n*contoh:* .dellist aturan grup`)
            }
            const key = text.trim().toLowerCase()
            if (!data.items[key]) return m.adReply('Nama list tidak ditemukan.')

            delete data.items[key]
            saveList()
            return m.adReply(`Berhasil menghapus list: *${text.trim()}*`)
        }

        if (command === 'list') {
            const keys = Object.keys(data.items).sort()
            if (keys.length === 0) return m.adReply('Belum ada list yang terdaftar di grup ini.')

            const now = new Date()
            const timeFormat = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.')
            const dateFormat = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })

            let msg = data.template
            const listRegex = /^(.*)@list/m
            const match = msg.match(listRegex)

            if (match) {
                const prefix = match[1]
                const listString = keys.map(v => `${prefix}${v.toUpperCase()}`).join('\n')
                msg = msg.replace(/^(.*)@list(.*)$/m, listString)
            } else {
                const listString = keys.map(v => `│ׄ ☕︎ ${v.toUpperCase()}`).join('\n')
                msg = msg.replace(/@list/g, listString)
            }

            msg = msg
                .replace(/@user/g, `@${m.sender.split('@')[0]}`)
                .replace(/@groupname/g, groupName)
                .replace(/@jam/g, timeFormat)
                .replace(/@tanggal/g, dateFormat)

            return m.adReply(msg, { mentions: [m.sender] })
        }
    }
}
