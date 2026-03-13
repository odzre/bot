import fs from 'fs'

const dbPath = './database/db.json'
const usersPath = './database/users.json'
const listPath = './database/list.json'
const prosesPath = './database/proses.json'
const groupsPath = './database/groups.json'
const digiPath = './database/digiflazzproduk.json'
const transaksiPath = './database/transaksi.json'
const aliasPath = './database/digi_alias.json'
const marginPath = './database/margin.json'
const stockPath = './database/stock.json'

if (!fs.existsSync('./database')) fs.mkdirSync('./database')

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ groups: {} }))
if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, JSON.stringify([]))
if (!fs.existsSync(listPath)) fs.writeFileSync(listPath, JSON.stringify({}))
if (!fs.existsSync(prosesPath)) fs.writeFileSync(prosesPath, JSON.stringify({ active: {}, settings: {} }))
if (!fs.existsSync(groupsPath)) fs.writeFileSync(groupsPath, JSON.stringify({}))
if (!fs.existsSync(digiPath)) fs.writeFileSync(digiPath, JSON.stringify([]))
if (!fs.existsSync(transaksiPath)) fs.writeFileSync(transaksiPath, JSON.stringify([]))
if (!fs.existsSync(aliasPath)) fs.writeFileSync(aliasPath, JSON.stringify({}))
if (!fs.existsSync(marginPath)) fs.writeFileSync(marginPath, JSON.stringify({
    silver: { percent: 2, flat: 500 },
    gold: { percent: 1, flat: 200 },
    premium: { percent: 0, flat: 0 }
}))
if (!fs.existsSync(stockPath)) fs.writeFileSync(stockPath, JSON.stringify({ categories: [], products: {} }))

export const db = JSON.parse(fs.readFileSync(dbPath))
export const users = JSON.parse(fs.readFileSync(usersPath))
export const listDb = JSON.parse(fs.readFileSync(listPath))
export const prosesDb = JSON.parse(fs.readFileSync(prosesPath))
export const groupsDb = JSON.parse(fs.readFileSync(groupsPath))
export const digiDb = JSON.parse(fs.readFileSync(digiPath))
export const transaksiDb = JSON.parse(fs.readFileSync(transaksiPath))
export const digiAlias = JSON.parse(fs.readFileSync(aliasPath))
export const marginDb = JSON.parse(fs.readFileSync(marginPath))
export const stockDb = JSON.parse(fs.readFileSync(stockPath))

export const saveDB = () => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
export const saveList = () => fs.writeFileSync(listPath, JSON.stringify(listDb, null, 2))
export const saveProses = () => fs.writeFileSync(prosesPath, JSON.stringify(prosesDb, null, 2))
export const saveGroups = () => fs.writeFileSync(groupsPath, JSON.stringify(groupsDb, null, 2))
export const saveDigi = () => fs.writeFileSync(digiPath, JSON.stringify(digiDb, null, 2))
export const saveTransaksi = () => fs.writeFileSync(transaksiPath, JSON.stringify(transaksiDb, null, 2))
export const saveDigiAlias = () => fs.writeFileSync(aliasPath, JSON.stringify(digiAlias, null, 2))
export const saveMargin = () => fs.writeFileSync(marginPath, JSON.stringify(marginDb, null, 2))
export const saveStock = () => fs.writeFileSync(stockPath, JSON.stringify(stockDb, null, 2))
export const saveUsers = () => fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))

export const saveUser = (pushname, jid, lid) => {
    if (!lid) return
    const index = users.findIndex(u => u.lid === lid)
    if (index === -1) {
        users.push({
            pushname: pushname || 'No Name',
            jid: (jid && !jid.endsWith('@lid')) ? jid : lid,
            lid: lid,
            role: 'silver',
            saldo: 0,
            currency: 'IDR'
        })
    } else {
        if (pushname && pushname !== 'No Name') users[index].pushname = pushname
        if (jid && !jid.endsWith('@lid')) users[index].jid = jid
    }
    saveUsers()
}

export const getUser = (id) => users.find(u => u.lid === id || u.jid === id)

export const getListData = (jid) => {
    if (!listDb[jid]) {
        listDb[jid] = { template: 'Haii @user, ini adalah list @groupname\n\n@list', items: {} }
        saveList()
    }
    return listDb[jid]
}

export const getProsesSettings = (jid) => {
    if (!prosesDb.settings[jid]) {
        prosesDb.settings[jid] = {
            proses: '「 *PESANAN DIPROSES* 」\n\nID: #@id\n@jam | @tanggal\n\n@user, pesananmu sedang diproses oleh @admin.\n\n*Pesanan:* @pesan',
            done: '「 *PESANAN SELESAI* 」\n\nID: #@id\n@jam | @tanggal\n\nBerhasil diselesaikan oleh @admin.\nTerima kasih @user sudah order!'
        }
        saveProses()
    }
    return prosesDb.settings[jid]
}

export const getGroupSettings = (jid) => {
    if (!db.groups[jid]) {
        db.groups[jid] = {
            welcome: false,
            left: false,
            welcomeMsg: 'Halo @pushname, selamat datang di @gcname @picture=auto',
            leftMsg: 'Selamat tinggal @pushname dari @gcname @picture=auto',
            openMsg: 'Grup telah dibuka oleh admin.',
            closeMsg: 'Grup telah ditutup oleh admin.',
            antilinkgc: false,
            antilinkall: false
        }
        saveDB()
    }
    return db.groups[jid]
}

export const updateGroupSettings = (jid, settings) => {
    db.groups[jid] = { ...getGroupSettings(jid), ...settings }
    saveDB()
}