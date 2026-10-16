export type ItemKind = 'game' | 'web' | 'app' | 'video'

export type CatalogItem = {
  id: string
  title: string
  kind: ItemKind
  blurb: string
  tags: string[]
  emoji: string
  tint: string
  players: string
  route: string
  url?: string
  videoId?: string
}

export const catalog: CatalogItem[] = [
  {
    id: 'space-waves',
    title: 'Space Waves',
    kind: 'game',
    blurb: '75 levels, endless, race, stars, secret paths, skins.',
    tags: ['space', 'waves', 'arcade', 'reflex', 'flying'],
    emoji: '🚀',
    tint: 'linear-gradient(135deg, #071428, #6ef7ff 55%, #ff2f92)',
    players: '1 player',
    route: '#/play/space-waves',
  },
  {
    id: 'bottle-flip',
    title: 'Bottle Flip Master',
    kind: 'game',
    blurb: '100 levels. Tap to flip, land upright, climb stairs and tables.',
    tags: ['bottle', 'flip', 'platform', 'tap', 'stairs'],
    emoji: '🍾',
    tint: 'linear-gradient(135deg, #2a1408, #1db954 50%, #ffd166)',
    players: '1 player',
    route: '#/play/bottle-flip',
  },
  {
    id: 'football-bros',
    title: 'Football Bros',
    kind: 'game',
    blurb: '9-on-9 NFL. Beat 10 AIs in a row, win the Super Bowl, spend coins on upgrades.',
    tags: ['football', 'sports', 'nfl', 'bros', 'league', 'super bowl'],
    emoji: '🏈',
    tint: 'linear-gradient(135deg, #14532d, #0b2265 55%, #d50a0a)',
    players: '1–2 players',
    route: '#/play/football-bros',
  },
  {
    id: 'box-bounce',
    title: 'Box Bounce',
    kind: 'game',
    blurb: 'Tap to flap through the gates.',
    tags: ['flappy', 'reflex', 'flying'],
    emoji: '📦',
    tint: 'linear-gradient(135deg, #1c3a12, #d6ff4a)',
    players: '1 player',
    route: '#/play/box-bounce',
  },
  {
    id: 'pulse-pong',
    title: 'Pulse Pong',
    kind: 'game',
    blurb: 'Rally against a greedy arcade bot.',
    tags: ['pong', 'sports', 'versus'],
    emoji: '🏓',
    tint: 'linear-gradient(135deg, #14204a, #7aa2ff)',
    players: '1 player',
    route: '#/play/pulse-pong',
  },
  {
    id: 'brick-bash',
    title: 'Brick Bash',
    kind: 'game',
    blurb: 'Break the wall. Do not drop the orb.',
    tags: ['breakout', 'bricks', 'arcade'],
    emoji: '🧱',
    tint: 'linear-gradient(135deg, #4a1808, #ff7a3d)',
    players: '1 player',
    route: '#/play/brick-bash',
  },
  {
    id: 'memory-grid',
    title: 'Memory Grid',
    kind: 'game',
    blurb: 'Flip tiles and match the pairs.',
    tags: ['puzzle', 'memory', 'cards'],
    emoji: '🧠',
    tint: 'linear-gradient(135deg, #3a1450, #e9a6ff)',
    players: '1 player',
    route: '#/play/memory-grid',
  },
  {
    id: 'tap-rush',
    title: 'Tap Rush',
    kind: 'game',
    blurb: 'Pop the orbs before they burn out.',
    tags: ['tap', 'reflex', 'casual'],
    emoji: '🎯',
    tint: 'linear-gradient(135deg, #4a0f2a, #ff5d8f)',
    players: '1 player',
    route: '#/play/tap-rush',
  },
  {
    id: 'tile-merge',
    title: 'Tile Merge',
    kind: 'game',
    blurb: 'Slide numbers. Fuse them. Chase 2048.',
    tags: ['2048', 'puzzle', 'numbers'],
    emoji: '🔢',
    tint: 'linear-gradient(135deg, #3a2a08, #ffd166)',
    players: '1 player',
    route: '#/play/tile-merge',
  },
  {
    id: 'crazygames',
    title: 'CrazyGames',
    kind: 'web',
    blurb: 'Play OvO, Tunnel Rush, Smash Karts and more right here.',
    tags: ['portal', 'web', 'crazy games', 'online'],
    emoji: '🕹️',
    tint: 'linear-gradient(135deg, #101826, #4cc9f0)',
    players: 'web',
    route: '#/crazy',
    url: 'https://www.crazygames.com',
  },
  {
    id: 'poki',
    title: 'Poki',
    kind: 'web',
    blurb: 'Search instant games inside Mathplayplace — or type a vibe and play a generated one.',
    tags: ['portal', 'web', 'poki', 'poke', 'search'],
    emoji: '🟣',
    tint: 'linear-gradient(135deg, #1b1030, #b517ff)',
    players: 'web',
    route: '#/poki',
    url: 'https://poki.com',
  },
  {
    id: 'itch',
    title: 'itch.io',
    kind: 'web',
    blurb: 'Indie games, jams, and weird little worlds.',
    tags: ['indie', 'web', 'itch'],
    emoji: '🌙',
    tint: 'linear-gradient(135deg, #1a1020, #fa5c5c)',
    players: 'web',
    route: '#/web?url=https://itch.io/games/html5',
    url: 'https://itch.io/games/html5',
  },
  {
    id: 'newgrounds',
    title: 'Newgrounds',
    kind: 'web',
    blurb: 'Flash-era energy, still shipping games.',
    tags: ['web', 'newgrounds', 'flash'],
    emoji: '💀',
    tint: 'linear-gradient(135deg, #1a0a0a, #ff9f1c)',
    players: 'web',
    route: '#/web?url=https://www.newgrounds.com/games',
    url: 'https://www.newgrounds.com/games',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    kind: 'app',
    blurb: 'Watch trailers and play-throughs in-app.',
    tags: ['video', 'youtube', 'watch'],
    emoji: '▶️',
    tint: 'linear-gradient(135deg, #3a0a0a, #ff2a2a)',
    players: 'app',
    route: '#/app/youtube',
  },
  {
    id: 'clips',
    title: 'Clips',
    kind: 'app',
    blurb: 'Vertical short videos, TikTok-style.',
    tags: ['tiktok', 'clips', 'video', 'short'],
    emoji: '📱',
    tint: 'linear-gradient(135deg, #0a0a14, #ff2f92)',
    players: 'app',
    route: '#/app/clips',
  },
  {
    id: 'phone',
    title: 'Phone',
    kind: 'app',
    blurb: 'Dial arcade characters. Yes, really.',
    tags: ['phone', 'call', 'dialer'],
    emoji: '☎️',
    tint: 'linear-gradient(135deg, #082018, #34d399)',
    players: 'app',
    route: '#/app/phone',
  },
  {
    id: 'messages',
    title: 'Messages',
    kind: 'app',
    blurb: 'Text the Arcade concierge for recs.',
    tags: ['messages', 'chat', 'sms'],
    emoji: '💬',
    tint: 'linear-gradient(135deg, #0a1a28, #5eead4)',
    players: 'app',
    route: '#/app/messages',
  },
  {
    id: 'notes',
    title: 'Notes',
    kind: 'app',
    blurb: 'Scratch ideas for your next generated game.',
    tags: ['notes', 'write'],
    emoji: '📝',
    tint: 'linear-gradient(135deg, #2a2408, #f5e6a3)',
    players: 'app',
    route: '#/app/notes',
  },
  {
    id: 'calculator',
    title: 'Calculator',
    kind: 'app',
    blurb: 'Because every phone has one.',
    tags: ['calculator', 'math'],
    emoji: '🧮',
    tint: 'linear-gradient(135deg, #121212, #a3a3a3)',
    players: 'app',
    route: '#/app/calculator',
  },
  {
    id: 'music',
    title: 'Beats',
    kind: 'app',
    blurb: 'A tiny drum pad while you wait to respawn.',
    tags: ['music', 'audio', 'beats'],
    emoji: '🎵',
    tint: 'linear-gradient(135deg, #1a0830, #c084fc)',
    players: 'app',
    route: '#/app/music',
  },
  {
    id: 'lab',
    title: 'AI Lab',
    kind: 'app',
    blurb: 'Type a vibe. Get a playable game.',
    tags: ['ai', 'generator', 'create'],
    emoji: '✦',
    tint: 'linear-gradient(135deg, #1a1030, #6ef7ff)',
    players: 'app',
    route: '#/lab',
  },
  {
    id: 'search',
    title: 'PlaySearch',
    kind: 'app',
    blurb: 'The Mathplayplace Google. Games, sites, apps.',
    tags: ['search', 'google', 'find'],
    emoji: '🔎',
    tint: 'linear-gradient(135deg, #101018, #93c5fd)',
    players: 'app',
    route: '#/search',
  },
  {
    id: 'yt-minecraft',
    title: 'Minecraft trailer',
    kind: 'video',
    blurb: 'Watch inside the YouTube app.',
    tags: ['minecraft', 'youtube', 'trailer'],
    emoji: '⛏️',
    tint: 'linear-gradient(135deg, #0f2a12, #4ade80)',
    players: 'watch',
    route: '#/app/youtube?v=MmB9b5njVbA',
    videoId: 'MmB9b5njVbA',
  },
  {
    id: 'yt-celeste',
    title: 'Celeste trailer',
    kind: 'video',
    blurb: 'Climb. Die. Climb better.',
    tags: ['celeste', 'youtube', 'platformer'],
    emoji: '🍓',
    tint: 'linear-gradient(135deg, #2a1030, #fb7185)',
    players: 'watch',
    route: '#/app/youtube?v=70d9lrXdUPo',
    videoId: '70d9lrXdUPo',
  },
  {
    id: 'yt-hades',
    title: 'Hades trailer',
    kind: 'video',
    blurb: 'Escape the underworld on repeat.',
    tags: ['hades', 'youtube', 'roguelike'],
    emoji: '🔥',
    tint: 'linear-gradient(135deg, #2a0a0a, #f97316)',
    players: 'watch',
    route: '#/app/youtube?v=91t0ha9x0AE',
    videoId: '91t0ha9x0AE',
  },
]

export const playableGames = catalog.filter((item) => item.kind === 'game')

export const phoneApps = catalog.filter((item) => item.kind === 'app')

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return catalog

  return catalog
    .map((item) => {
      const hay = `${item.title} ${item.blurb} ${item.tags.join(' ')}`.toLowerCase()
      let score = 0
      if (item.title.toLowerCase() === q) score += 50
      if (item.title.toLowerCase().includes(q)) score += 20
      if (item.tags.some((tag) => tag.includes(q))) score += 12
      if (hay.includes(q)) score += 6
      for (const word of q.split(/\s+/)) {
        if (word.length > 2 && hay.includes(word)) score += 3
      }
      return { item, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item)
}

export function getGame(id: string): CatalogItem | undefined {
  return catalog.find((item) => item.id === id)
}

export const webShortcuts = [
  { label: 'CrazyGames', url: 'arcadeos:crazy' },
  { label: 'Poki', url: 'arcadeos:poki' },
  { label: 'itch.io', url: 'https://itch.io/games/html5' },
  { label: 'Newgrounds', url: 'https://www.newgrounds.com/games' },
  { label: 'Miniplay', url: 'https://www.miniplay.com' },
  { label: 'Armor Games', url: 'https://armorgames.com' },
]
