const BASE_URL = 'https://cekid-zz.vercel.app'

const getFlag = (code) => {
    if (!code) return ''
    if (code.length !== 2) return '🌐' 

    const offset = 127397 
    return code.toUpperCase().split('').map(char => 
        String.fromCodePoint(char.charCodeAt(0) + offset)
    ).join('')
}

export const gameList = {
    'ml1': { 
        name: 'Mobile Legends: Bang Bang',
        slug: 'mobile-legends',
        endpoint: '/api/game/mobile-legends',
        hasZone: true 
    },
    'ml2': { 
        name: 'Mobile Legends (Global)',
        slug: 'mobile-legends-gp',
        endpoint: '/api/game/mobile-legends-gp',
        hasZone: true 
    },
    'ml3': { 
        name: 'Mobile Legends: Adventure',
        slug: 'mobile-legends-adventure',
        endpoint: '/api/game/mobile-legends-adventure',
        hasZone: true 
    },
    'ml4': { 
        name: 'Mobile Legends (Mobapay)',
        slug: 'mobile-legends-mp',
        endpoint: '/api/game/mobile-legends-mp',
        hasZone: true 
    },
    'ml5': { 
        name: 'Mobile Legends (DG)',
        slug: 'mobile-legends-dg',
        endpoint: '/api/game/mobile-legends-dg',
        hasZone: true 
    },
    'ml6': { 
        name: 'Cek Region MLBB',
        slug: 'cek-region-mlbb-m',
        endpoint: '/api/game/cek-region-mlbb-m',
        hasZone: true 
    },
    'ml7': { 
        name: 'Cek Region MLBB 2',
        slug: 'check-region-mlbb',
        endpoint: '/api/game/check-region-mlbb',
        hasZone: true 
    },
    'ml8': { 
        name: 'Mobile Legends (Limit)',
        slug: 'mobile-legends-l',
        endpoint: '/api/game/mobile-legends-l',
        hasZone: true 
    },
    'ff1': { 
        name: 'Free Fire',
        slug: 'free-fire',
        endpoint: '/api/game/free-fire',
        hasZone: false 
    },
    'ff2': { 
        name: 'Free Fire Max',
        slug: 'free-fire-max',
        endpoint: '/api/game/free-fire-max',
        hasZone: false 
    },
    'ff3': { 
        name: 'Free Fire Indonesia',
        slug: 'free-fire-indonesia-gp',
        endpoint: '/api/game/free-fire-indonesia-gp',
        hasZone: false 
    },
    'ff4': { 
        name: 'Free Fire Global',
        slug: 'free-fire-global-region-ws',
        endpoint: '/api/game/free-fire-global-region-ws',
        hasZone: false 
    },
    'ff5': { 
        name: 'Free Fire (DG)',
        slug: 'freefire-dg',
        endpoint: '/api/game/freefire-dg',
        hasZone: false 
    },
    'ff6': { 
        name: 'Free Fire Global (Alt)',
        slug: 'free-fire-global-2-k',
        endpoint: '/api/game/free-fire-global-2-k',
        hasZone: false 
    },
    'ff7': { 
        name: 'Free Fire Global (Stats)',
        slug: 'free-fire-global-region-ws-k',
        endpoint: '/api/game/free-fire-global-region-ws-k',
        hasZone: false 
    },
    'ff8': { 
        name: 'Free Fire Global 2',
        slug: 'free-fire-global-2',
        endpoint: '/api/game/free-fire-global-2',
        hasZone: false 
    },
    'ff9': { 
        name: 'Free Fire BD/NP',
        slug: 'free-fire-global-zzzz',
        endpoint: '/api/game/free-fire-global-zzzz',
        hasZone: false 
    },
    'ff10': { 
        name: 'Free Fire Global (Alt V2)',
        slug: 'free-fire-global-alt-v2',
        endpoint: '/api/game/free-fire-global-alt-v2',
        hasZone: false 
    },
    'ff11': { 
        name: 'Free Fire (DG Alt)',
        slug: 'freefire-dg-a',
        endpoint: '/api/game/freefire-dg-a',
        hasZone: false 
    },
    'ff12': { 
        name: 'Free Fire MAX Top-up',
        slug: 'free-fire-max-cd',
        endpoint: '/api/game/free-fire-max-cd',
        hasZone: false 
    },
    'pubg1': { 
        name: 'PUBG Mobile (Global 2)',
        slug: 'pubg-mobile-global-vc',
        endpoint: '/api/game/pubg-mobile-global-vc',
        hasZone: false 
    },
    'pubg2': { 
        name: 'PUBG Mobile (Global)',
        slug: 'pubg-mobile-gp',
        endpoint: '/api/game/pubg-mobile-gp',
        hasZone: false 
    },
    'genshin1': { 
        name: 'Genshin Impact',
        slug: 'genshin-impact',
        endpoint: '/api/game/genshin-impact',
        hasZone: true 
    },
    'genshin2': { 
        name: 'Genshin Impact (GP)',
        slug: 'genshin-impact-gp',
        endpoint: '/api/game/genshin-impact-gp',
        hasZone: true 
    },
    'genshin3': { 
        name: 'Genshin Impact (DG)',
        slug: 'genshin-crystal-dg',
        endpoint: '/api/game/genshin-crystal-dg',
        hasZone: true 
    },
    'honkai1': { 
        name: 'Honkai: Star Rail',
        slug: 'honkai-star-rail',
        endpoint: '/api/game/honkai-star-rail',
        hasZone: true 
    },
    'honkai2': { 
        name: 'Honkai Star Rail (GP)',
        slug: 'honkai-star-rail-gp',
        endpoint: '/api/game/honkai-star-rail-gp',
        hasZone: true 
    },
    'honkai3': { 
        name: 'Honkai Star Rail (DG)',
        slug: 'honkai-star-rail-dg',
        endpoint: '/api/game/honkai-star-rail-dg',
        hasZone: true 
    },
    'honkai4': { 
        name: 'Honkai Impact 3',
        slug: 'honkai-impact-3',
        endpoint: '/api/game/honkai-impact-3',
        hasZone: false 
    },
    'honkai5': { 
        name: 'Honkai Impact 3 (GP)',
        slug: 'honkai-impact-3-gp',
        endpoint: '/api/game/honkai-impact-3-gp',
        hasZone: false 
    },
    'hok1': { 
        name: 'Honor of Kings',
        slug: 'honor-of-kings-tp',
        endpoint: '/api/game/honor-of-kings-tp',
        hasZone: false 
    },
    'hok2': { 
        name: 'Honor of Kings 2',
        slug: 'honor-of-kings-gp',
        endpoint: '/api/game/honor-of-kings-gp',
        hasZone: false 
    },
    'aov1': { 
        name: 'Arena of Valor',
        slug: 'arena-of-valor',
        endpoint: '/api/game/arena-of-valor',
        hasZone: false 
    },
    'aov2': { 
        name: 'Arena of Valor (GP)',
        slug: 'arena-of-valor-gp',
        endpoint: '/api/game/arena-of-valor-gp',
        hasZone: false 
    },
    'aov3': { 
        name: 'Arena of Valor (DG)',
        slug: 'aov-dg',
        endpoint: '/api/game/aov-dg',
        hasZone: false 
    },
    'codm1': { 
        name: 'Call of Duty Mobile',
        slug: 'call-of-duty-mobile',
        endpoint: '/api/game/call-of-duty-mobile',
        hasZone: false 
    },
    'codm2': { 
        name: 'Call of Duty Mobile (ID)',
        slug: 'call-of-duty-mobile-id-gp',
        endpoint: '/api/game/call-of-duty-mobile-id-gp',
        hasZone: false 
    },
    'codm3': { 
        name: 'Call of Duty Mobile (DG)',
        slug: 'call-of-duty-mobile-dg',
        endpoint: '/api/game/call-of-duty-mobile-dg',
        hasZone: false 
    },
    'val1': { 
        name: 'Valorant',
        slug: 'valorant',
        endpoint: '/api/game/valorant',
        hasZone: false 
    },
    'val2': { 
        name: 'Valorant (GP)',
        slug: 'valorant-gp',
        endpoint: '/api/game/valorant-gp',
        hasZone: false 
    },
    'val3': { 
        name: 'Valorant (DG)',
        slug: 'valorant-dg',
        endpoint: '/api/game/valorant-dg',
        hasZone: false 
    },
    'ss1': { 
        name: 'Super Sus',
        slug: 'super-sus',
        endpoint: '/api/game/super-sus',
        hasZone: false 
    },
    'ss2': { 
        name: 'Super Sus (GP)',
        slug: 'super-sus-gp',
        endpoint: '/api/game/super-sus-gp',
        hasZone: false 
    },
    'ss3': { 
        name: 'Super Sus (DG)',
        slug: 'super-sus-dg',
        endpoint: '/api/game/super-sus-dg',
        hasZone: false 
    },
    'sm1': { 
        name: 'Sausage Man',
        slug: 'sausage-man',
        endpoint: '/api/game/sausage-man',
        hasZone: true 
    },
    'sm2': { 
        name: 'Sausage Man (GP)',
        slug: 'sausage-man-gp',
        endpoint: '/api/game/sausage-man-gp',
        hasZone: false 
    },
    'sm3': { 
        name: 'Sausage Man (DG)',
        slug: 'sausage-man-dg',
        endpoint: '/api/game/sausage-man-dg',
        hasZone: false 
    },
    'rag1': { 
        name: 'Ragnarok X: Next Generation',
        slug: 'ragnarok-x-next-generation',
        endpoint: '/api/game/ragnarok-x-next-generation',
        hasZone: true 
    },
    'rag2': { 
        name: 'Ragnarok X: Next Generation (GP)',
        slug: 'ragnarok-x-next-generation-gp',
        endpoint: '/api/game/ragnarok-x-next-generation-gp',
        hasZone: true 
    },
    'rag3': { 
        name: 'Ragnarok Origin (DG)',
        slug: 'ragnarok-origin-dg',
        endpoint: '/api/game/ragnarok-origin-dg',
        hasZone: true 
    },
    'rag4': { 
        name: 'Ragnarok M: Eternal Love',
        slug: 'ragnarok-m-eternal-love-big-cat-coin',
        endpoint: '/api/game/ragnarok-m-eternal-love-big-cat-coin',
        hasZone: true 
    },
    'pb1': { 
        name: 'Point Blank',
        slug: 'point-blank',
        endpoint: '/api/game/point-blank',
        hasZone: false 
    },
    'pb2': { 
        name: 'Point Blank (GP)',
        slug: 'point-blank-gp',
        endpoint: '/api/game/point-blank-gp',
        hasZone: false 
    },
    'pb3': { 
        name: 'Point Blank (DG)',
        slug: 'point-blank-dg',
        endpoint: '/api/game/point-blank-dg',
        hasZone: false 
    },
    'mc1': { 
        name: 'Magic Chess: Go Go',
        slug: 'magic-chess-go-go',
        endpoint: '/api/game/magic-chess-go-go',
        hasZone: true 
    },
    'mc2': { 
        name: 'Magic Chess Go Go Go (GP)',
        slug: 'magic-chess-gp',
        endpoint: '/api/game/magic-chess-gp',
        hasZone: true 
    },
    'mc3': { 
        name: 'Magic Chess (DG)',
        slug: 'magic-chess-dg',
        endpoint: '/api/game/magic-chess-dg',
        hasZone: true 
    },
    'mc4': { 
        name: 'Magic Chess (Mobapay)',
        slug: 'magic-chess-mp',
        endpoint: '/api/game/magic-chess-mp',
        hasZone: true 
    },
    'higgs': { 
        name: 'Higgs Domino',
        slug: 'higgs-domino',
        endpoint: '/api/game/higgs-domino',
        hasZone: false 
    },
    'ab': { 
        name: 'Arena Breakout',
        slug: 'arena-breakout-gp',
        endpoint: '/api/game/arena-breakout-gp',
        hasZone: false 
    },
    'dr': { 
        name: 'Dragon Raja',
        slug: 'dragon-raja-tp',
        endpoint: '/api/game/dragon-raja-tp',
        hasZone: false 
    },
    'fc': { 
        name: 'EA SPORTS FC Mobile',
        slug: 'ea-sports-fc-mobile-gp',
        endpoint: '/api/game/ea-sports-fc-mobile-gp',
        hasZone: false 
    },
    'jwk': { 
        name: 'Jawaker',
        slug: 'jawaker',
        endpoint: '/api/game/jawaker',
        hasZone: false 
    },
    'ko': { 
        name: 'Knives Out',
        slug: 'knives-out-ng',
        endpoint: '/api/game/knives-out-ng',
        hasZone: true 
    },
    'wrl': { 
        name: 'League of Legends: Wild Rift (GP)',
        slug: 'league-of-legends-wild-rift-gp',
        endpoint: '/api/game/league-of-legends-wild-rift-gp',
        hasZone: false 
    },
    'la': { 
        name: 'LifeAfter (GP)',
        slug: 'lifeafter-gp',
        endpoint: '/api/game/lifeafter-gp',
        hasZone: true 
    },
    'maple': { 
        name: 'MapleStory M',
        slug: 'maplestory-m-rz',
        endpoint: '/api/game/maplestory-m-rz',
        hasZone: true 
    },
    'msa': { 
        name: 'Metal Slug Awakening',
        slug: 'metal-slug-awakening-gp',
        endpoint: '/api/game/metal-slug-awakening-gp',
        hasZone: false 
    },
    'mps': { 
        name: 'Mirage: Perfect Skyline',
        slug: 'mirageperfect-skyline-gp',
        endpoint: '/api/game/mirageperfect-skyline-gp',
        hasZone: true 
    },
    'ws': { 
        name: 'Whiteout Survival',
        slug: 'whiteout-survival-gp',
        endpoint: '/api/game/whiteout-survival-gp',
        hasZone: false 
    },
    'yl': { 
        name: 'Yalla Ludo',
        slug: 'yalla-ludo',
        endpoint: '/api/game/yalla-ludo',
        hasZone: false 
    },
    'yp': { 
        name: 'Yalla Pay',
        slug: 'yalla-pay',
        endpoint: '/api/game/yalla-pay',
        hasZone: false 
    },
    'bgmi': { 
        name: 'BGMI',
        slug: 'bgmi',
        endpoint: '/api/game/bgmi',
        hasZone: false 
    },
    'fun': { 
        name: '4Fun Chat',
        slug: '4fun-chat',
        endpoint: '/api/game/4fun-chat',
        hasZone: false 
    },
    'azal': { 
        name: 'Azal Live',
        slug: 'azal-live',
        endpoint: '/api/game/azal-live',
        hasZone: false 
    },
    'bella': { 
        name: 'Bella Chat',
        slug: 'bella-chat',
        endpoint: '/api/game/bella-chat',
        hasZone: false 
    },
    'bigo': { 
        name: 'Bigo Live 2',
        slug: 'bigo-live-bp',
        endpoint: '/api/game/bigo-live-bp',
        hasZone: false 
    },
    'bigo2': { 
        name: 'Bigo Live (Alt)',
        slug: 'bigo-live-zzzz',
        endpoint: '/api/game/bigo-live-zzzz',
        hasZone: false 
    },
    'bg': { 
        name: 'Blockman Go',
        slug: 'blockman-go',
        endpoint: '/api/game/blockman-go',
        hasZone: false 
    },
    'lemo': { 
        name: 'Lemo Chat',
        slug: 'lemo-chat',
        endpoint: '/api/game/lemo-chat',
        hasZone: false 
    },
    'ola': { 
        name: 'Olamet Chat',
        slug: 'olamet-chat',
        endpoint: '/api/game/olamet-chat',
        hasZone: false 
    },
    'poppo': { 
        name: 'Poppo Live Global',
        slug: 'poppo-live-bp',
        endpoint: '/api/game/poppo-live-bp',
        hasZone: false 
    },
    'poppo2': { 
        name: 'Poppo Live 2',
        slug: 'poppo-live-zzz',
        endpoint: '/api/game/poppo-live-zzz',
        hasZone: false 
    },
    'soul': { 
        name: 'Soul Chat',
        slug: 'soul-chat',
        endpoint: '/api/game/soul-chat',
        hasZone: false 
    },
    'soyo': { 
        name: 'Soyo Chat',
        slug: 'soyo-chat',
        endpoint: '/api/game/soyo-chat',
        hasZone: false 
    },
    'tada': { 
        name: 'Tada Chat',
        slug: 'tada-chat',
        endpoint: '/api/game/tada-chat',
        hasZone: false 
    },
    'talk': { 
        name: 'Talk Talk Chat',
        slug: 'talk-talk-chat',
        endpoint: '/api/game/talk-talk-chat',
        hasZone: false 
    },
    'tami': { 
        name: 'Tami Chat',
        slug: 'tami-chat',
        endpoint: '/api/game/tami-chat',
        hasZone: false 
    },
    'waho': { 
        name: 'Waho Chat',
        slug: 'waho-chat',
        endpoint: '/api/game/waho-chat',
        hasZone: false 
    },
    'ys': { 
        name: 'You Star',
        slug: 'you-star',
        endpoint: '/api/game/you-star',
        hasZone: false 
    },
    '8bp': { 
        name: '8 Ball Pool',
        slug: '8-ball-pool',
        endpoint: '/api/game/8-ball-pool',
        hasZone: false 
    },
    'afk': { 
        name: 'AFK Journey',
        slug: 'afk-journey',
        endpoint: '/api/game/afk-journey',
        hasZone: false 
    },
    'au2': { 
        name: 'AU2 Mobile',
        slug: 'au2-mobile',
        endpoint: '/api/game/au2-mobile',
        hasZone: false 
    },
    'au2b': { 
        name: 'AU2 Mobile 2',
        slug: 'au2-mobile-2',
        endpoint: '/api/game/au2-mobile-2',
        hasZone: false 
    },
    'aog': { 
        name: 'Advent of God: Legends',
        slug: 'advent-of-godlegends',
        endpoint: '/api/game/advent-of-godlegends',
        hasZone: true 
    },
    'ahfs': { 
        name: 'Among Heroes: Fantasy Samkok',
        slug: 'among-heroes-fantasy-samkok',
        endpoint: '/api/game/among-heroes-fantasy-samkok',
        hasZone: true 
    },
    'as': { 
        name: 'Angel Squad (DG)',
        slug: 'angel-squad-dg',
        endpoint: '/api/game/angel-squad-dg',
        hasZone: false 
    },
    'ammh': { 
        name: 'Arena Mania: Magic Heroes',
        slug: 'arena-mania-magic-heroes',
        endpoint: '/api/game/arena-mania-magic-heroes',
        hasZone: true 
    },
    'a9': { 
        name: 'Asphalt 9: Legends',
        slug: 'asphalt-9-legends',
        endpoint: '/api/game/asphalt-9-legends',
        hasZone: true 
    },
    'agcf': { 
        name: 'Astral Guardians: Cyber Fantasy',
        slug: 'astral-guardians-cyber-fantasy',
        endpoint: '/api/game/astral-guardians-cyber-fantasy',
        hasZone: true 
    },
    'ac': { 
        name: 'Auto Chess',
        slug: 'auto-chess',
        endpoint: '/api/game/auto-chess',
        hasZone: false 
    },
    'al': { 
        name: 'Azur Lane',
        slug: 'azur-lane',
        endpoint: '/api/game/azur-lane',
        hasZone: true 
    },
    'bsk': { 
        name: 'Basketrio',
        slug: 'basketrio',
        endpoint: '/api/game/basketrio',
        hasZone: true 
    },
    'btk': { 
        name: 'Be The King: Judge Destiny',
        slug: 'be-the-king-judge-destiny',
        endpoint: '/api/game/be-the-king-judge-destiny',
        hasZone: true 
    },
    'bmd': { 
        name: 'Bermuda',
        slug: 'bermuda',
        endpoint: '/api/game/bermuda',
        hasZone: false 
    },
    'bigo3': { 
        name: 'Bigo Live',
        slug: 'bigo-live',
        endpoint: '/api/game/bigo-live',
        hasZone: false 
    },
    'bm3d': { 
        name: 'Bleach Mobile 3D (DG)',
        slug: 'bleach-mobile-3d-dg',
        endpoint: '/api/game/bleach-mobile-3d-dg',
        hasZone: true 
    },
    'bgc': { 
        name: 'Blizzard Gift Card (DG)',
        slug: 'blizzard-gift-card-dg',
        endpoint: '/api/game/blizzard-gift-card-dg',
        hasZone: false 
    },
    'bs': { 
        name: 'Blood Strike',
        slug: 'blood-strike',
        endpoint: '/api/game/blood-strike',
        hasZone: true 
    },
    'bsdg': { 
        name: 'Blood Strike (DG)',
        slug: 'blood-strike-dg',
        endpoint: '/api/game/blood-strike-dg',
        hasZone: true 
    },
    'ctdt': { 
        name: 'Captain Tsubasa: Dream Team',
        slug: 'captain-tsubasa-dream-team',
        endpoint: '/api/game/captain-tsubasa-dream-team',
        hasZone: false 
    },
    'cfm': { 
        name: 'Cat Fantasy Majamojo (DG)',
        slug: 'cat-fantasy-majamojo-dg',
        endpoint: '/api/game/cat-fantasy-majamojo-dg',
        hasZone: false 
    },
    'cham': { 
        name: 'Chamet',
        slug: 'chamet',
        endpoint: '/api/game/chamet',
        hasZone: false 
    },
    'ccgw': { 
        name: 'City of Crime: Gang Wars',
        slug: 'city-of-crime-gang-wars',
        endpoint: '/api/game/city-of-crime-gang-wars',
        hasZone: false 
    },
    'cr': { 
        name: 'Clash Royale',
        slug: 'clash-royale-st',
        endpoint: '/api/game/clash-royale-st',
        hasZone: false 
    },
    'coc': { 
        name: 'Clash of Clans',
        slug: 'clash-of-st',
        endpoint: '/api/game/clash-of-st',
        hasZone: false 
    },
    'css': { 
        name: 'Cloud Song: Saga of Skywalkers',
        slug: 'cloud-song-saga-of-skywalkers',
        endpoint: '/api/game/cloud-song-saga-of-skywalkers',
        hasZone: false 
    },
    'cb': { 
        name: 'ColorBANG',
        slug: 'colorbang',
        endpoint: '/api/game/colorbang',
        hasZone: false 
    },
    'ca': { 
        name: 'Cooking Adventure',
        slug: 'cooking-adventure',
        endpoint: '/api/game/cooking-adventure',
        hasZone: false 
    },
    'co': { 
        name: 'Crasher Origin',
        slug: 'crasher-origin',
        endpoint: '/api/game/crasher-origin',
        hasZone: true 
    },
    'cris': { 
        name: 'Crisis Action',
        slug: 'crisis-action',
        endpoint: '/api/game/crisis-action',
        hasZone: true 
    },
    'ct': { 
        name: 'Culinary Tour',
        slug: 'culinary-tour',
        endpoint: '/api/game/culinary-tour',
        hasZone: true 
    },
    'dt': { 
        name: 'DEAD TARGET',
        slug: 'dead-target-zombie-games-3d',
        endpoint: '/api/game/dead-target-zombie-games-3d',
        hasZone: false 
    },
    'dcm': { 
        name: 'Dark Continent: Mist',
        slug: 'dark-continent-mist',
        endpoint: '/api/game/dark-continent-mist',
        hasZone: true 
    },
    'dazz': { 
        name: 'Dazz Live',
        slug: 'dazz-live',
        endpoint: '/api/game/dazz-live',
        hasZone: false 
    },
    'di': { 
        name: 'Diablo: Immortal',
        slug: 'diablo-immortal',
        endpoint: '/api/game/diablo-immortal',
        hasZone: false 
    },
    'dmk': { 
        name: 'Disney Magic Kingdoms',
        slug: 'disney-magic-kingdoms',
        endpoint: '/api/game/disney-magic-kingdoms',
        hasZone: false 
    },
    'dc': { 
        name: 'Dragon City',
        slug: 'dragon-city',
        endpoint: '/api/game/dragon-city',
        hasZone: false 
    },
    'dhhl': { 
        name: 'Dragon Hunters: Heroes Legends',
        slug: 'dragon-hunters-heroes-legends',
        endpoint: '/api/game/dragon-hunters-heroes-legends',
        hasZone: true 
    },
    'dnm': { 
        name: 'Dragon Nest M: Classic',
        slug: 'dragon-nest-m-classic',
        endpoint: '/api/game/dragon-nest-m-classic',
        hasZone: true 
    },
    'dr2': { 
        name: 'Dragon Raja',
        slug: 'dragon-raja',
        endpoint: '/api/game/dragon-raja',
        hasZone: false 
    },
    'drdg': { 
        name: 'Dragon Raja (DG)',
        slug: 'dragon-raja-dg',
        endpoint: '/api/game/dragon-raja-dg',
        hasZone: false 
    },
    'dlr': { 
        name: 'Dream and the Lethe Record',
        slug: 'dream-and-the-lethe-record',
        endpoint: '/api/game/dream-and-the-lethe-record',
        hasZone: false 
    },
    'dcd': { 
        name: 'Dunk City Dynasty',
        slug: 'dunk-city-dynasty',
        endpoint: '/api/game/dunk-city-dynasty',
        hasZone: true 
    },
    'fc2': { 
        name: 'EA SPORTS FC Mobile',
        slug: 'ea-sports-fc-mobile',
        endpoint: '/api/game/ea-sports-fc-mobile',
        hasZone: false 
    },
    'fcdg': { 
        name: 'EA Sports FC Mobile (DG)',
        slug: 'ea-sports-fc-mobile-dg',
        endpoint: '/api/game/ea-sports-fc-mobile-dg',
        hasZone: false 
    },
    'eggy': { 
        name: 'EGGY PARTY',
        slug: 'eggy-party',
        endpoint: '/api/game/eggy-party',
        hasZone: true 
    },
    'ete': { 
        name: 'ETE Chronicle (DG)',
        slug: 'ete-chronicle-dg',
        endpoint: '/api/game/ete-chronicle-dg',
        hasZone: false 
    },
    'echo': { 
        name: 'Echocalypse',
        slug: 'echocalypse',
        endpoint: '/api/game/echocalypse',
        hasZone: true 
    },
    'echodg': { 
        name: 'Echocalypse (DG)',
        slug: 'echocalypse-dg',
        endpoint: '/api/game/echocalypse-dg',
        hasZone: true 
    },
    'et': { 
        name: 'Elemental Titans',
        slug: 'elemental-titans-3d-idle-arena',
        endpoint: '/api/game/elemental-titans-3d-idle-arena',
        hasZone: true 
    },
    'eld': { 
        name: 'Embers: Last Duel',
        slug: 'embers-last-duel',
        endpoint: '/api/game/embers-last-duel',
        hasZone: false 
    },
    'ent': { 
        name: 'Entropy 2099',
        slug: 'entropy-2099',
        endpoint: '/api/game/entropy-2099',
        hasZone: false 
    },
    'eoc': { 
        name: 'Era of Celestials',
        slug: 'era-of-celestials',
        endpoint: '/api/game/era-of-celestials',
        hasZone: true 
    },
    'ffc': { 
        name: 'Food Fantasy Crystal',
        slug: 'food-fantasy-crystal',
        endpoint: '/api/game/food-fantasy-crystal',
        hasZone: true 
    },
    'fdb': { 
        name: 'Football Dream: Be A Pro',
        slug: 'football-dream-be-a-pro',
        endpoint: '/api/game/football-dream-be-a-pro',
        hasZone: false 
    },
    'fm2': { 
        name: 'Football Master 2',
        slug: 'football-master-2',
        endpoint: '/api/game/football-master-2',
        hasZone: false 
    },
    'fw2': { 
        name: 'ForsakenWorld 2',
        slug: 'forsakenworld-2',
        endpoint: '/api/game/forsakenworld-2',
        hasZone: false 
    },
    'gogo': { 
        name: 'GOGO LIVE',
        slug: 'gogo-live',
        endpoint: '/api/game/gogo-live',
        hasZone: false 
    },
    'gsu': { 
        name: 'Game Speed Up (DG)',
        slug: 'game-speed-up-dg',
        endpoint: '/api/game/game-speed-up-dg',
        hasZone: false 
    },
    'gshell': { 
        name: 'Garena Shells (DG)',
        slug: 'garena-dg',
        endpoint: '/api/game/garena-dg',
        hasZone: false 
    },
    'ge': { 
        name: 'Garuda Eleven (DG)',
        slug: 'garuda-eleven-dg',
        endpoint: '/api/game/garuda-eleven-dg',
        hasZone: false 
    },
    'gs': { 
        name: 'Ghost Story: Love Destiny',
        slug: 'ghost-story-love-destiny',
        endpoint: '/api/game/ghost-story-love-destiny',
        hasZone: false 
    },
    'gc': { 
        name: 'Girls Connect',
        slug: 'girls-connect-idle-rpg',
        endpoint: '/api/game/girls-connect-idle-rpg',
        hasZone: true 
    },
    'gp': { 
        name: 'Google Play (DG)',
        slug: 'google-play-dg',
        endpoint: '/api/game/google-play-dg',
        hasZone: false 
    },
    'gt': { 
        name: 'Growtopia',
        slug: 'growtopia',
        endpoint: '/api/game/growtopia',
        hasZone: false 
    },
    'gtdg': { 
        name: 'Growtopia (DG)',
        slug: 'growtopia-dg',
        endpoint: '/api/game/growtopia-dg',
        hasZone: false 
    },
    'hago': { 
        name: 'Hago',
        slug: 'hago',
        endpoint: '/api/game/hago',
        hasZone: false 
    },
    'hagodg': { 
        name: 'Hago (DG)',
        slug: 'hago-dg',
        endpoint: '/api/game/hago-dg',
        hasZone: false 
    },
    'hp': { 
        name: 'Harry Potter: Magic Awakened',
        slug: 'harry-potter-magic-awakened',
        endpoint: '/api/game/harry-potter-magic-awakened',
        hasZone: true 
    },
    'hpdg': { 
        name: 'Harry Potter (DG)',
        slug: 'harry-potter-magic-awakened-dg',
        endpoint: '/api/game/harry-potter-magic-awakened-dg',
        hasZone: true 
    },
    'hbr': { 
        name: 'Heaven Burns Red',
        slug: 'heaven-burns-red',
        endpoint: '/api/game/heaven-burns-red',
        hasZone: false 
    },
    'hdr': { 
        name: 'Heaven Domain: Rebirth',
        slug: 'heaven-domain-rebirth',
        endpoint: '/api/game/heaven-domain-rebirth',
        hasZone: true 
    },
    'he': { 
        name: 'Heroes Evolved',
        slug: 'heroes-evolved',
        endpoint: '/api/game/heroes-evolved',
        hasZone: true 
    },
    'hedg': { 
        name: 'Heroes Evolved (DG)',
        slug: 'heroes-evolved-dg',
        endpoint: '/api/game/heroes-evolved-dg',
        hasZone: true 
    },
    'huk': { 
        name: 'Heroic Uncle Kim',
        slug: 'heroic-uncle-kim-idle-rpg',
        endpoint: '/api/game/heroic-uncle-kim-idle-rpg',
        hasZone: false 
    },
    'iqiyi': { 
        name: 'IQIYI',
        slug: 'iqiyi',
        endpoint: '/api/game/iqiyi',
        hasZone: false 
    },
    'idv': { 
        name: 'Identity V',
        slug: 'identity-v',
        endpoint: '/api/game/identity-v',
        hasZone: true 
    },
    'il': { 
        name: 'Idle Legends',
        slug: 'idle-legends',
        endpoint: '/api/game/idle-legends',
        hasZone: true 
    },
    'ip': { 
        name: 'Idol Party',
        slug: 'idol-party',
        endpoint: '/api/game/idol-party',
        hasZone: false 
    },
    'igg': { 
        name: 'Invincible: Guarding the Globe',
        slug: 'invincible-guarding-the-globe',
        endpoint: '/api/game/invincible-guarding-the-globe',
        hasZone: false 
    },
    'ifr': { 
        name: 'Isekai Feast: Tales of Recipes',
        slug: 'isekai-feast-tales-of-recipes',
        endpoint: '/api/game/isekai-feast-tales-of-recipes',
        hasZone: true 
    },
    'jl': { 
        name: 'Jade Legends: Immortal Realm',
        slug: 'jade-legends-immortal-realm',
        endpoint: '/api/game/jade-legends-immortal-realm',
        hasZone: true 
    },
    'koa': { 
        name: 'King of Avalon',
        slug: 'king-of-avalon',
        endpoint: '/api/game/king-of-avalon',
        hasZone: false 
    },
    'lap': { 
        name: 'Laplace M',
        slug: 'laplace-m',
        endpoint: '/api/game/laplace-m',
        hasZone: false 
    },
    'lapdg': { 
        name: 'Laplace Mobile (DG)',
        slug: 'laplace-mobile-dg',
        endpoint: '/api/game/laplace-mobile-dg',
        hasZone: false 
    },
    'lol': { 
        name: 'League of Legends',
        slug: 'league-of-legends',
        endpoint: '/api/game/league-of-legends',
        hasZone: false 
    },
    'loldg': { 
        name: 'League of Legends (DG)',
        slug: 'league-of-legends-dg',
        endpoint: '/api/game/league-of-legends-dg',
        hasZone: false 
    },
    'lfs': { 
        name: 'Legacy Fate: Sacred & Fearless',
        slug: 'legacy-fate-sacred-and-fearless',
        endpoint: '/api/game/legacy-fate-sacred-and-fearless',
        hasZone: true 
    },
    'lom': { 
        name: 'Legend of Mushroom: Rush',
        slug: 'legend-of-mushroom-rush',
        endpoint: '/api/game/legend-of-mushroom-rush',
        hasZone: true 
    },
    'lor': { 
        name: 'Legends of Runeterra',
        slug: 'legends-of-runeterra',
        endpoint: '/api/game/legends-of-runeterra',
        hasZone: false 
    },
    'lm': { 
        name: 'Life Makeover',
        slug: 'life-makeover',
        endpoint: '/api/game/life-makeover',
        hasZone: false 
    },
    'la2': { 
        name: 'LifeAfter',
        slug: 'lifeafter',
        endpoint: '/api/game/lifeafter',
        hasZone: true 
    },
    'like': { 
        name: 'Likee',
        slug: 'likee',
        endpoint: '/api/game/likee',
        hasZone: false 
    },
    'lita': { 
        name: 'Lita',
        slug: 'lita',
        endpoint: '/api/game/lita',
        hasZone: false 
    },
    'litadg': { 
        name: 'Lita (DG)',
        slug: 'lita-dg',
        endpoint: '/api/game/lita-dg',
        hasZone: false 
    },
    'livu': { 
        name: 'LivU',
        slug: 'livu',
        endpoint: '/api/game/livu',
        hasZone: false 
    },
    'lad': { 
        name: 'Love and Deepspace',
        slug: 'love-and-deepspace',
        endpoint: '/api/game/love-and-deepspace',
        hasZone: false 
    },
    'luna': { 
        name: 'Luna Fantasia (DG)',
        slug: 'luna-fantasia-dg',
        endpoint: '/api/game/luna-fantasia-dg',
        hasZone: false 
    },
    'md': { 
        name: 'MARVEL Duel',
        slug: 'marvel-duel',
        endpoint: '/api/game/marvel-duel',
        hasZone: false 
    },
    'mr': { 
        name: 'MOB RUSH',
        slug: 'mob-rush',
        endpoint: '/api/game/mob-rush',
        hasZone: true 
    },
    'mu3': { 
        name: 'MU ORIGIN 3',
        slug: 'mu-origin-3',
        endpoint: '/api/game/mu-origin-3',
        hasZone: false 
    },
    'mu2': { 
        name: 'MU Origin 2',
        slug: 'mu-origin-2',
        endpoint: '/api/game/mu-origin-2',
        hasZone: true 
    },
    'mu3dg': { 
        name: 'MU Origin 3 (DG)',
        slug: 'mu-origin-3-dg',
        endpoint: '/api/game/mu-origin-3-dg',
        hasZone: false 
    },
    'mw': { 
        name: 'Machina Waking',
        slug: 'machina-waking',
        endpoint: '/api/game/machina-waking',
        hasZone: true 
    },
    'mjs': { 
        name: 'Mahjong Soul',
        slug: 'mahjong-soul',
        endpoint: '/api/game/mahjong-soul',
        hasZone: false 
    },
    'maple2': { 
        name: 'MapleStory M (Coda)',
        slug: 'maplestory-m',
        endpoint: '/api/game/maplestory-m',
        hasZone: true 
    },
    'maple3': { 
        name: 'MapleStory M',
        slug: 'maplestory-m-cd',
        endpoint: '/api/game/maplestory-m-cd',
        hasZone: true 
    },
    'meyo': { 
        name: 'MeYo',
        slug: 'meyo',
        endpoint: '/api/game/meyo',
        hasZone: false 
    },
    'mega': { 
        name: 'Megaxus (DG)',
        slug: 'mi-cash-dg',
        endpoint: '/api/game/mi-cash-dg',
        hasZone: false 
    },
    'msdg': { 
        name: 'Metal Slug (DG)',
        slug: 'metal-slug-dg',
        endpoint: '/api/game/metal-slug-dg',
        hasZone: false 
    },
    'msa2': { 
        name: 'Metal Slug: Awakening',
        slug: 'metal-slug-awakening',
        endpoint: '/api/game/metal-slug-awakening',
        hasZone: false 
    },
    'mine': { 
        name: 'Minecraft (DG)',
        slug: 'minecraft-dg',
        endpoint: '/api/game/minecraft-dg',
        hasZone: false 
    },
    'mps2': { 
        name: 'Mirage: Perfect Skyline',
        slug: 'mirage-perfect-skyline',
        endpoint: '/api/game/mirage-perfect-skyline',
        hasZone: true 
    },
    'mixu': { 
        name: 'Mixu',
        slug: 'mixu',
        endpoint: '/api/game/mixu',
        hasZone: false 
    },
    'mc5': { 
        name: 'Modern Combat 5',
        slug: 'modern-combat-5-blackout',
        endpoint: '/api/game/modern-combat-5-blackout',
        hasZone: false 
    },
    'mso': { 
        name: 'Modern Strike Online',
        slug: 'modern-strike-online',
        endpoint: '/api/game/modern-strike-online',
        hasZone: false 
    },
    'mse': { 
        name: 'Monster Saga: Evolution',
        slug: 'monster-saga-evolution',
        endpoint: '/api/game/monster-saga-evolution',
        hasZone: true 
    },
    'mbm': { 
        name: 'Moonlight Blade M',
        slug: 'moonlight-blade-m',
        endpoint: '/api/game/moonlight-blade-m',
        hasZone: false 
    },
    'md13': { 
        name: 'Mythic Dawn: 13 Megami',
        slug: 'mythic-dawn-13-megami',
        endpoint: '/api/game/mythic-dawn-13-megami',
        hasZone: true 
    },
    'ne': { 
        name: 'NetEase Pay (DG)',
        slug: 'netease-pay-dg',
        endpoint: '/api/game/netease-pay-dg',
        hasZone: false 
    },
    'ot': { 
        name: 'OCTOPATH TRAVELER',
        slug: 'octopath-traveler-cotc',
        endpoint: '/api/game/octopath-traveler-cotc',
        hasZone: true 
    },
    'opm': { 
        name: 'One Punch Man',
        slug: 'one-punch-man-the-strongest',
        endpoint: '/api/game/one-punch-man-the-strongest',
        hasZone: true 
    },
    'opmdg': { 
        name: 'One Punch Man (DG)',
        slug: 'one-punch-man-dg',
        endpoint: '/api/game/one-punch-man-dg',
        hasZone: true 
    },
    'oa': { 
        name: 'Onmyoji Arena',
        slug: 'onmyoji-arena',
        endpoint: '/api/game/onmyoji-arena',
        hasZone: false 
    },
    'pso2': { 
        name: 'PSO2 New Genesis',
        slug: 'phantasy-star-online-2-new-genesis',
        endpoint: '/api/game/phantasy-star-online-2-new-genesis',
        hasZone: false 
    },
    'ptn': { 
        name: 'Path to Nowhere',
        slug: 'path-to-nowhere',
        endpoint: '/api/game/path-to-nowhere',
        hasZone: false 
    },
    'pr': { 
        name: 'Paw Rumble',
        slug: 'paw-rumble',
        endpoint: '/api/game/paw-rumble',
        hasZone: false 
    },
    'prdg': { 
        name: 'Paw Rumble (DG)',
        slug: 'paw-rumble-dg',
        endpoint: '/api/game/paw-rumble-dg',
        hasZone: false 
    },
    'pteb': { 
        name: 'Paw Tales: Eternal Bond',
        slug: 'paw-tales-eternal-bond',
        endpoint: '/api/game/paw-tales-eternal-bond',
        hasZone: true 
    },
    'pw': { 
        name: 'Perfect World (DG)',
        slug: 'perfect-world-dg',
        endpoint: '/api/game/perfect-world-dg',
        hasZone: true 
    },
    'pbe': { 
        name: 'Phantom Blade: Executioners',
        slug: 'phantom-blade-executioners',
        endpoint: '/api/game/phantom-blade-executioners',
        hasZone: false 
    },
    'pg3d': { 
        name: 'Pixel Gun 3D',
        slug: 'pixel-gun-3d',
        endpoint: '/api/game/pixel-gun-3d',
        hasZone: false 
    },
    'poppo3': { 
        name: 'Poppo Live',
        slug: 'poppo-live',
        endpoint: '/api/game/poppo-live',
        hasZone: false 
    },
    'ph': { 
        name: 'Potato Hero: Zombie',
        slug: 'potato-hero-zombie-survival',
        endpoint: '/api/game/potato-hero-zombie-survival',
        hasZone: true 
    },
    'pgr': { 
        name: 'Punishing: Gray Raven',
        slug: 'punishing-gray-raven',
        endpoint: '/api/game/punishing-gray-raven',
        hasZone: true 
    },
    'rm': { 
        name: 'Racing Master',
        slug: 'racing-master',
        endpoint: '/api/game/racing-master',
        hasZone: true 
    },
    'razer': { 
        name: 'Razer Gold (DG)',
        slug: 'razer-gold-dg',
        endpoint: '/api/game/razer-gold-dg',
        hasZone: false 
    },
    'rev': { 
        name: 'Revelation Mobile (DG)',
        slug: 'revelation-mobile-dg',
        endpoint: '/api/game/revelation-mobile-dg',
        hasZone: false 
    },
    'rev2': { 
        name: 'Revelation: Infinite',
        slug: 'revelation-infinite-journey',
        endpoint: '/api/game/revelation-infinite-journey',
        hasZone: false 
    },
    'rbx': { 
        name: 'Roblox (DG)',
        slug: 'roblox-voucher-dg',
        endpoint: '/api/game/roblox-voucher-dg',
        hasZone: false 
    },
    'sugo': { 
        name: 'SUGO',
        slug: 'sugo',
        endpoint: '/api/game/sugo',
        hasZone: false 
    },
    'ssa': { 
        name: 'Saint Seiya: Awakening',
        slug: 'saint-seiya-awakening',
        endpoint: '/api/game/saint-seiya-awakening',
        hasZone: true 
    },
    'sf': { 
        name: 'Samkok Fantasy',
        slug: 'samkok-fantasy',
        endpoint: '/api/game/samkok-fantasy',
        hasZone: false 
    },
    'soo': { 
        name: 'Scroll of Onmyoji',
        slug: 'scroll-of-onmyoji-sakura--sword',
        endpoint: '/api/game/scroll-of-onmyoji-sakura--sword',
        hasZone: true 
    },
    'sn': { 
        name: 'Shining Nikki',
        slug: 'shining-nikki',
        endpoint: '/api/game/shining-nikki',
        hasZone: false 
    },
    'sab': { 
        name: 'Silver and Blood',
        slug: 'silver-and-blood-mp',
        endpoint: '/api/game/silver-and-blood-mp',
        hasZone: true 
    },
    'scz': { 
        name: 'Snowbreak: Containment',
        slug: 'snowbreak-containment-zone',
        endpoint: '/api/game/snowbreak-containment-zone',
        hasZone: true 
    },
    'sd': { 
        name: 'Speed Drifters',
        slug: 'speed-drifters',
        endpoint: '/api/game/speed-drifters',
        hasZone: false 
    },
    'sddg': { 
        name: 'Speed Drifters (DG)',
        slug: 'speed-drifters-dg',
        endpoint: '/api/game/speed-drifters-dg',
        hasZone: false 
    },
    'star': { 
        name: 'StarMaker',
        slug: 'starmaker',
        endpoint: '/api/game/starmaker',
        hasZone: false 
    },
    'sos': { 
        name: 'State of Survival',
        slug: 'state-of-survival',
        endpoint: '/api/game/state-of-survival',
        hasZone: false 
    },
    'sosdg': { 
        name: 'State of Survival (DG)',
        slug: 'state-of-survival-dg',
        endpoint: '/api/game/state-of-survival-dg',
        hasZone: false 
    },
    'sg': { 
        name: 'Stumble Guys',
        slug: 'stumble-guys',
        endpoint: '/api/game/stumble-guys',
        hasZone: false 
    },
    'try': { 
        name: 'Tamashi: Rise of Yokai',
        slug: 'tamashi-rise-of-yokai',
        endpoint: '/api/game/tamashi-rise-of-yokai',
        hasZone: true 
    },
    'tftdg': { 
        name: 'Teamfight Tactics (DG)',
        slug: 'teamfight-dg',
        endpoint: '/api/game/teamfight-dg',
        hasZone: false 
    },
    'tft': { 
        name: 'Teamfight Tactics',
        slug: 'teamfight-tactics-mobile',
        endpoint: '/api/game/teamfight-tactics-mobile',
        hasZone: false 
    },
    'tlon': { 
        name: 'Legend of Neverland (DG)',
        slug: 'the-legend-of-neverland-dg',
        endpoint: '/api/game/the-legend-of-neverland-dg',
        hasZone: false 
    },
    'lotr': { 
        name: 'LOTR: Rise to War',
        slug: 'the-lord-of-the-rings-rise-to-war',
        endpoint: '/api/game/the-lord-of-the-rings-rise-to-war',
        hasZone: true 
    },
    'trch': { 
        name: 'Return of Condor Heroes',
        slug: 'the-return-of-condor-heroes',
        endpoint: '/api/game/the-return-of-condor-heroes',
        hasZone: true 
    },
    'ta': { 
        name: 'Thetan Arena',
        slug: 'thetan-arena',
        endpoint: '/api/game/thetan-arena',
        hasZone: false 
    },
    'tr': { 
        name: 'Time Raiders',
        slug: 'time-raiders',
        endpoint: '/api/game/time-raiders',
        hasZone: true 
    },
    'tinder': { 
        name: 'Tinder',
        slug: 'tinder',
        endpoint: '/api/game/tinder',
        hasZone: false 
    },
    'tnj': { 
        name: 'Tom and Jerry: Chase',
        slug: 'tom-and-jerry-chase',
        endpoint: '/api/game/tom-and-jerry-chase',
        hasZone: true 
    },
    'tnjdg': { 
        name: 'Tom and Jerry (DG)',
        slug: 'tom-and-jerry-chase-dg',
        endpoint: '/api/game/tom-and-jerry-chase-dg',
        hasZone: true 
    },
    'te': { 
        name: 'Top Eleven',
        slug: 'top-eleven',
        endpoint: '/api/game/top-eleven',
        hasZone: false 
    },
    'tumile': { 
        name: 'Tumile',
        slug: 'tumile',
        endpoint: '/api/game/tumile',
        hasZone: false 
    },
    'turbo': { 
        name: 'Turbo VPN',
        slug: 'turbo-vpn',
        endpoint: '/api/game/turbo-vpn',
        hasZone: false 
    },
    'uwo': { 
        name: 'Uncharted Waters (DG)',
        slug: 'uncharted-waters-origin-dg',
        endpoint: '/api/game/uncharted-waters-origin-dg',
        hasZone: false 
    },
    'undawn': { 
        name: 'Undawn',
        slug: 'undawn',
        endpoint: '/api/game/undawn',
        hasZone: false 
    },
    'undawndg': { 
        name: 'Undawn (DG)',
        slug: 'undawn-dg',
        endpoint: '/api/game/undawn-dg',
        hasZone: false 
    },
    'unipin': { 
        name: 'Unipin Credits (DG)',
        slug: 'unipin-dg',
        endpoint: '/api/game/unipin-dg',
        hasZone: false 
    },
    'vidio': { 
        name: 'Vidio',
        slug: 'vidio',
        endpoint: '/api/game/vidio',
        hasZone: false 
    },
    'viu': { 
        name: 'Viu',
        slug: 'viu-direct-top-up',
        endpoint: '/api/game/viu-direct-top-up',
        hasZone: false 
    },
    'mjm': { 
        name: 'Voucher Majamojo (DG)',
        slug: 'majamojo-mobile-dg',
        endpoint: '/api/game/majamojo-mobile-dg',
        hasZone: false 
    },
    'wpo': { 
        name: 'War Planet Online',
        slug: 'war-planet-online',
        endpoint: '/api/game/war-planet-online',
        hasZone: false 
    },
    'wor': { 
        name: 'Watcher of Realms',
        slug: 'watcher-of-realms',
        endpoint: '/api/game/watcher-of-realms',
        hasZone: true 
    },
    'web': { 
        name: 'Webnovel',
        slug: 'webnovel',
        endpoint: '/api/game/webnovel',
        hasZone: false 
    },
    'wa': { 
        name: 'Westward Adventure',
        slug: 'westward-adventure',
        endpoint: '/api/game/westward-adventure',
        hasZone: false 
    },
    'wos': { 
        name: 'Whisper of Shadow',
        slug: 'whisper-of-shadow',
        endpoint: '/api/game/whisper-of-shadow',
        hasZone: false 
    },
    'whg': { 
        name: 'Wild Hunter: Goddess',
        slug: 'wild-hunter-goddess',
        endpoint: '/api/game/wild-hunter-goddess',
        hasZone: true 
    },
    'wwh': { 
        name: 'World War Heroes',
        slug: 'world-war-heroes',
        endpoint: '/api/game/world-war-heroes',
        hasZone: false 
    },
    'ys6': { 
        name: 'YS 6 Mobile VNG',
        slug: 'ys-6-mobile-vng',
        endpoint: '/api/game/ys-6-mobile-vng',
        hasZone: false 
    },
    'yh': { 
        name: 'Yong Heroes',
        slug: 'yong-heroes',
        endpoint: '/api/game/yong-heroes',
        hasZone: true 
    },
    'zep': { 
        name: 'ZEPETO',
        slug: 'zepeto',
        endpoint: '/api/game/zepeto',
        hasZone: false 
    },
    'zzz': { 
        name: 'Zenless Zone Zero',
        slug: 'zenless-zone-zero',
        endpoint: '/api/game/zenless-zone-zero',
        hasZone: true 
    },
    'zepdg': { 
        name: 'Zepeto (DG)',
        slug: 'zepeto-dg',
        endpoint: '/api/game/zepeto-dg',
        hasZone: false 
    }
}

export const checkGameId = async (gameCode, id, zone = '') => {
    try {
        const game = gameList[gameCode]
        if (!game) return { status: false, message: 'Game tidak ditemukan.' }

        if (game.hasZone && !zone) {
            return { status: false, message: `Game ${game.name} butuh Zone ID.\nContoh: .cek${gameCode} ${id} 1234` }
        }

        let requestUrl = `${BASE_URL}${game.endpoint}?id=${id}`
        if (game.hasZone) requestUrl += `&zone=${zone}`

        const req = await fetch(requestUrl)
        const res = await req.json()

        if (!res) return { status: false, message: 'Server error.' }
        
        const nickname = 
            res.data?.basicInfo?.nickname || 
            res.data?.username || 
            res.data?.nickname || 
            res.name || 
            res.nickname ||
            res.data?.name || 
            res.data || 
            null

        if (!nickname || typeof nickname !== 'string') {
            return { status: false, message: 'ID Salah / Tidak Ditemukan.' }
        }

        let regionCode = 
            res.data?.region || 
            res.data?.basicInfo?.region || 
            res.region || 
            null
            
        let regionDisplay = '-'
        if (regionCode) {
            const flag = getFlag(regionCode)
            regionDisplay = `${flag} ${regionCode}`
        }

        return {
            status: true,
            data: {
                game: game.name,
                id: id,
                zone: zone || '-',
                nickname: nickname,
                region: regionDisplay
            }
        }

    } catch (e) {
        return { status: false, message: e.message }
    }
}

export const checkDoubleML = async (id, zone) => {
    try {
        const urlRegion = `${BASE_URL}/api/game/cek-region-mlbb-m?id=${id}&zone=${zone}`
        const urlLimit = `${BASE_URL}/api/game/mobile-legends-l?id=${id}&zone=${zone}`

        const [reqRegion, reqLimit] = await Promise.all([
            fetch(urlRegion),
            fetch(urlLimit)
        ])

        const resRegion = await reqRegion.json()
        const resLimit = await reqLimit.json()

        if (!resRegion.status && !resLimit.status) {
            return { status: false, message: 'ID atau Zone salah.' }
        }

        const dataR = resRegion.data || {}
        const dataL = resLimit.data || {}

        const nickname = dataR.username || dataL.username || '-'
        const regionCode = dataR.region || 'UNKNOWN'
        
        const weeklyRaw = dataL.is_weekly_pass_limit_reached
        const weeklyIcon = (weeklyRaw === false) ? '✅' : '❎'

        let combinedList = []

        if (dataL.first_recharge_list && Array.isArray(dataL.first_recharge_list)) {
            dataL.first_recharge_list.forEach(item => {
                const status = item.reached_limit === false ? '✅' : '❎'
                combinedList.push(`${status} ${item.title}`)
            })
        }

        if (dataL.double_diamonds && Array.isArray(dataL.double_diamonds)) {
            dataL.double_diamonds.forEach(item => {
                const status = item.reached_limit === false ? '✅' : '❎'
                combinedList.push(`${status} ${item.title}`)
            })
        }

        return {
            status: true,
            data: {
                nickname: nickname,
                id: id,
                zone: zone,
                region: regionCode,
                flag: getFlag(regionCode),
                weeklyStatus: weeklyIcon,
                firstRecharge: combinedList 
            }
        }

    } catch (e) {
        return { status: false, message: e.message }
    }
}