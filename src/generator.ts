export type GenConfig = {
  title: string
  blurb: string
  playerColor: string
  collectColor: string
  hazardColor: string
  bg: string
  gravity: number
  speed: number
  goal: number
  flavor: string
  genre: string
}

const palettes = [
  { player: '#6ef7ff', collect: '#ffd166', hazard: '#ff2f92', bg: '#0c1020' },
  { player: '#d6ff4a', collect: '#ffffff', hazard: '#ff7a3d', bg: '#102014' },
  { player: '#ff2f92', collect: '#6ef7ff', hazard: '#c084fc', bg: '#1a0814' },
  { player: '#ffd166', collect: '#7aa2ff', hazard: '#ff5d8f', bg: '#1a1408' },
]

function pick<T>(list: T[], seed: number): T {
  return list[Math.abs(seed) % list.length]
}

function hash(text: string): number {
  let n = 0
  for (let i = 0; i < text.length; i++) n = (n * 31 + text.charCodeAt(i)) | 0
  return n
}

export function generateGame(prompt: string): GenConfig {
  const raw = prompt.trim() || 'neon cats collecting stars in space'
  const text = raw.toLowerCase()
  const seed = hash(text)
  const palette = pick(palettes, seed)

  let genre = 'arcade collectathon'
  let gravity = 0.0007
  let speed = 0.008
  let flavor = 'WASD / arrows · Space to jump'
  let title = raw.replace(/\b\w/g, (c) => c.toUpperCase())
  if (title.length > 28) title = title.slice(0, 28).trim() + '…'

  if (/space|star|alien|galaxy|moon/.test(text)) {
    genre = 'zero-g space run'
    gravity = 0.00025
    flavor = 'Low gravity hop · grab the stars'
  } else if (/ocean|fish|sea|underwater/.test(text)) {
    genre = 'underwater dash'
    gravity = 0.00035
    flavor = 'Floaty swim · avoid the mines'
  } else if (/jump|platform|castle/.test(text)) {
    genre = 'platformer'
    gravity = 0.00095
    flavor = 'Jump the ledges · steal the gems'
  } else if (/race|car|fast/.test(text)) {
    genre = 'speed run'
    speed = 0.012
    flavor = 'Move fast · do not eat a spike'
  } else if (/cat|dog|frog|bird|creature/.test(text)) {
    genre = 'creature caper'
    flavor = 'Your critter wants snacks'
  } else if (/dark|horror|night/.test(text)) {
    genre = 'night survival'
    flavor = 'Lights out · grab orbs, dodge red'
  }

  const blurb = `A generated ${genre} from “${raw}”. Collect the glowing bits. Red squares hurt.`

  return {
    title,
    blurb,
    playerColor: palette.player,
    collectColor: palette.collect,
    hazardColor: palette.hazard,
    bg: palette.bg,
    gravity,
    speed,
    goal: 5 + (Math.abs(seed) % 4),
    flavor,
    genre,
  }
}

const lastKey = 'arcadeos-last-gen'

export function saveGenerated(config: GenConfig): void {
  localStorage.setItem(lastKey, JSON.stringify(config))
}

export function loadGenerated(): GenConfig | null {
  const raw = localStorage.getItem(lastKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GenConfig
  } catch {
    return null
  }
}
