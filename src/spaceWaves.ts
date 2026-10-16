type Unmount = () => void

export type WorldId = 'space' | 'lava' | 'water'
export type Difficulty = 'easy' | 'hard' | 'very-hard'
export type RunMode = 'level' | 'endless' | 'race'

type Skin = {
  id: string
  name: string
  fill: string
  trail: string
  hint: string
}

type Save = {
  stars: Record<string, number>
  secrets: string[]
  skins: string[]
  equipped: string
  endlessBest: number
  raceWins: number
}

const SAVE_KEY = 'arcadeos-space-waves-v2'
const LEVELS = 25

const worlds: { id: WorldId; title: string; blurb: string; emoji: string }[] = [
  { id: 'space', title: 'Space', blurb: 'Cold neon tunnels in the void.', emoji: '🌌' },
  { id: 'lava', title: 'Lava', blurb: 'Hot walls. Short gaps. Do not blink.', emoji: '🌋' },
  { id: 'water', title: 'Water', blurb: 'Deep current, tight coral, secret reefs.', emoji: '🌊' },
]

const skins: Skin[] = [
  { id: 'pulse', name: 'Pulse', fill: '#f4f1ff', trail: '#ff2f92', hint: 'Starter ship' },
  { id: 'comet', name: 'Comet', fill: '#6ef7ff', trail: '#93c5fd', hint: 'Earn 8 stars' },
  { id: 'ember', name: 'Ember', fill: '#ff7a3d', trail: '#ffd166', hint: 'Secret path in Lava 4' },
  { id: 'tide', name: 'Tide', fill: '#5eead4', trail: '#38bdf8', hint: 'Secret path in Water 4' },
  { id: 'ghost', name: 'Ghost', fill: '#e9a6ff', trail: '#c084fc', hint: 'Secret path in Space 5' },
  { id: 'gold', name: 'Nova', fill: '#ffd166', trail: '#fff7cc', hint: 'Earn 30 stars' },
  { id: 'void', name: 'Void', fill: '#111827', trail: '#6ef7ff', hint: 'Clear Space 25' },
  { id: 'magma', name: 'Magma', fill: '#fb7185', trail: '#f97316', hint: 'Clear Lava 25' },
  { id: 'reef', name: 'Reef', fill: '#34d399', trail: '#67e8f9', hint: 'Clear Water 25' },
  { id: 'racer', name: 'Racer', fill: '#f4f1ff', trail: '#d6ff4a', hint: 'Win 3 races' },
  { id: 'apex', name: 'Apex', fill: '#f4f1ff', trail: '#ff2f92', hint: 'Earn 120 stars' },
]

const themes = {
  space: { bg: '#070814', wall: '#12182c', line: '#6ef7ff', spike: '#ff2f92', star: '#ffd166' },
  lava: { bg: '#140806', wall: '#3a140c', line: '#ff7a3d', spike: '#ffd166', star: '#fff1c2' },
  water: { bg: '#04141c', wall: '#0a2834', line: '#5eead4', spike: '#38bdf8', star: '#a5f3fc' },
}

function hash(text: string): number {
  let n = 2166136261
  for (let i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619)
  return n >>> 0
}

function rng(seed: number): () => number {
  let s = seed || 1
  return () => {
    s = Math.imul(s ^ (s >>> 15), 16807) >>> 0
    return s / 4294967296
  }
}

export function difficultyFor(level: number): Difficulty {
  if (level <= 10) return 'easy'
  if (level <= 17) return 'hard'
  return 'very-hard'
}

function levelKey(world: WorldId, level: number): string {
  return `${world}-${level}`
}

function blankSave(): Save {
  return {
    stars: {},
    secrets: [],
    skins: ['pulse'],
    equipped: 'pulse',
    endlessBest: 0,
    raceWins: 0,
  }
}

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return blankSave()
    return { ...blankSave(), ...(JSON.parse(raw) as Save) }
  } catch {
    return blankSave()
  }
}

function persist(save: Save): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

type Spike = { x: number; fromTop: boolean }
type Pickup = { x: number; y: number; kind: 'coin' | 'secret'; got: boolean }

type Track = {
  length: number
  speed: number
  world: WorldId
  walls: (x: number) => { top: number; bot: number; blockTop?: number; blockBot?: number }
  spikes: Spike[]
  pickups: Pickup[]
  secretFrom: number
  secretTo: number
}

function statsFor(difficulty: Difficulty, endlessScore = 0) {
  if (difficulty === 'easy') return { length: 16.5, speed: 0.023, gap: 0.58, spikeEvery: 2.4 }
  if (difficulty === 'hard') return { length: 18, speed: 0.025, gap: 0.46, spikeEvery: 2.0 }
  const extra = Math.min(0.006, endlessScore * 0.00003)
  return { length: 20, speed: 0.028 + extra, gap: 0.36, spikeEvery: 1.55 }
}

function buildTrack(world: WorldId, level: number, mode: RunMode, endlessSeed = 1): Track {
  const difficulty =
    mode === 'endless'
      ? endlessSeed > 80
        ? 'very-hard'
        : endlessSeed > 35
          ? 'hard'
          : 'easy'
      : difficultyFor(level)
  const seed = hash(`${world}:${mode}:${level}:${endlessSeed}`)
  const rand = rng(seed)
  const { length, speed, gap, spikeEvery } = statsFor(difficulty, mode === 'endless' ? endlessSeed : 0)
  const courseLength = mode === 'endless' ? 400 : mode === 'race' ? length + 6 : length
  const waveA = 0.05 + rand() * 0.04
  const waveB = 0.02 + rand() * 0.03
  const freqA = 0.28 + rand() * 0.25
  const freqB = 0.7 + rand() * 0.5
  const secretFrom = Math.min(courseLength * 0.42, 5 + rand() * 3)
  const secretTo = secretFrom + 2.2
  const secretHigh = rand() > 0.5

  const walls = (x: number) => {
    const wave = waveA * Math.sin(x * freqA) + waveB * Math.sin(x * freqB + 1.2)
    let top = 0.5 - gap / 2 + wave
    let bot = 0.5 + gap / 2 + wave
    if (x > 10) {
      const squeeze = Math.min(0.08, (x - 10) * 0.0025 * (difficulty === 'very-hard' ? 1.6 : 1))
      top += squeeze
      bot -= squeeze
    }
    if (x >= secretFrom && x <= secretTo) {
      return { top, bot, blockTop: top + 0.26, blockBot: bot - 0.26 }
    }
    return { top, bot }
  }

  const spikes: Spike[] = []
  for (let x = 3.2; x < courseLength - 1.6; x += spikeEvery + rand() * 0.45) {
    if (x > secretFrom - 0.5 && x < secretTo + 0.5) continue
    spikes.push({ x, fromTop: rand() > 0.5 })
  }

  const pickups: Pickup[] = []
  for (let i = 0; i < 10; i++) {
    const x = 1.6 + ((courseLength - 3.2) * (i + 0.5)) / 10
    if (x > secretFrom - 0.3 && x < secretTo + 0.3) continue
    const band = walls(x)
    const midY = (band.top + band.bot) / 2
    const offset = ((i % 3) - 1) * ((band.bot - band.top) * 0.18)
    pickups.push({ x, y: midY + offset, kind: 'coin', got: false })
  }
  let guard = 0
  while (pickups.filter((p) => p.kind === 'coin').length < 10 && guard++ < 40) {
    const x = 2 + rand() * (courseLength - 4)
    if (x > secretFrom - 0.3 && x < secretTo + 0.3) continue
    const band = walls(x)
    pickups.push({
      x,
      y: (band.top + band.bot) / 2 + (rand() - 0.5) * 0.12,
      kind: 'coin',
      got: false,
    })
  }
  const secretWalls = walls((secretFrom + secretTo) / 2)
  pickups.push({
    x: (secretFrom + secretTo) / 2,
    y: secretHigh ? secretWalls.top + 0.12 : secretWalls.bot - 0.12,
    kind: 'secret',
    got: false,
  })

  return { length: courseLength, speed, world, walls, spikes, pickups, secretFrom, secretTo }
}

function totalStars(save: Save): number {
  return Object.values(save.stars).reduce((a, b) => a + b, 0)
}

function unlockedSkins(save: Save): string[] {
  const have = new Set(save.skins)
  have.add('pulse')
  if (totalStars(save) >= 8) have.add('comet')
  if (totalStars(save) >= 30) have.add('gold')
  if (totalStars(save) >= 120) have.add('apex')
  if (save.secrets.includes('lava-4')) have.add('ember')
  if (save.secrets.includes('water-4')) have.add('tide')
  if (save.secrets.includes('space-5')) have.add('ghost')
  if ((save.stars['space-25'] || 0) >= 1) have.add('void')
  if ((save.stars['lava-25'] || 0) >= 1) have.add('magma')
  if ((save.stars['water-25'] || 0) >= 1) have.add('reef')
  if (save.raceWins >= 3) have.add('racer')
  return [...have]
}

function starsForLevel(save: Save, world: WorldId, level: number): number {
  return save.stars[levelKey(world, level)] || 0
}

function levelOpen(save: Save, world: WorldId, level: number): boolean {
  if (level === 1) return true
  return starsForLevel(save, world, level - 1) >= 1
}

type Run = {
  mode: RunMode
  world: WorldId
  level: number
  track: Track
  x: number
  y: number
  holding: boolean
  started: boolean
  dead: boolean
  won: boolean
  deadAt: number
  trail: { x: number; y: number }[]
  usedSecret: boolean
  ghostX: number
  boosting: boolean
}

function spikeHit(px: number, py: number, spike: Spike, wall: { top: number; bot: number }): boolean {
  const half = 0.08
  const dx = Math.abs(px - spike.x)
  if (dx > half) return false
  const t = 1 - dx / half
  if (spike.fromTop) {
    const tip = wall.top + 0.13 * t
    return py >= wall.top && py <= tip
  }
  const tip = wall.bot - 0.13 * t
  return py <= wall.bot && py >= tip
}

export function mountSpaceWaves(host: HTMLElement): Unmount {
  let save = loadSave()
  save.skins = unlockedSkins(save)
  persist(save)

  let view: 'hub' | 'world' | 'skins' | 'play' = 'hub'
  let world: WorldId = 'space'
  let run: Run | null = null
  let raf = 0
  let canvas: HTMLCanvasElement | null = null

  host.classList.add('waves-host')

  const paintMenu = () => {
    cancelAnimationFrame(raf)
    canvas = null
    if (view === 'hub') {
      host.innerHTML = `
        <div class="waves-hub">
          <canvas class="waves-sky"></canvas>
          <div class="waves-menu waves-menu-front">
            <p class="waves-kicker">Space Waves</p>
            <h2>Pick a mode</h2>
            <p class="waves-sub">${totalStars(save)} stars · ${save.secrets.length} secrets · ${save.skins.length} skins</p>
            <div class="waves-modes">
              <button class="mode-sq" data-go="levels"><span>▦</span>Levels</button>
              <button class="mode-sq" data-go="endless"><span>∞</span>Endless</button>
              <button class="mode-sq" data-go="skins"><span>🚀</span>Skins</button>
            </div>
            <button class="waves-race-link" data-go="race">Race a ghost</button>
            <p class="waves-help">Hold to climb. Release to dive. Arrow keys speed you up. Levels last about 15–20 seconds.</p>
          </div>
        </div>`
      startHubSky()
      return
    }
    if (view === 'skins') {
      host.innerHTML = `
        <div class="waves-menu">
          <button class="waves-back" data-go="hub">← Modes</button>
          <h2>Skins</h2>
          <div class="waves-skins">
            ${skins
              .map((skin) => {
                const on = save.skins.includes(skin.id)
                return `<button class="skin-card ${save.equipped === skin.id ? 'eq' : ''}" data-skin="${skin.id}" ${
                  on ? '' : 'disabled'
                }>
                  <span class="skin-chip" style="background:${skin.fill};box-shadow:0 0 12px ${skin.trail}"></span>
                  <strong>${skin.name}</strong>
                  <em>${on ? (save.equipped === skin.id ? 'Equipped' : 'Unlock') : skin.hint}</em>
                </button>`
              })
              .join('')}
          </div>
        </div>`
      return
    }
    const list = Array.from({ length: LEVELS }, (_, i) => i + 1)
    host.innerHTML = `
      <div class="waves-menu">
        <button class="waves-back" data-go="hub">← Modes</button>
        <div class="waves-worlds">
          ${worlds
            .map(
              (w) =>
                `<button class="${w.id === world ? 'on' : ''}" data-world="${w.id}">${w.emoji} ${w.title}</button>`,
            )
            .join('')}
        </div>
        <p class="waves-sub">${worlds.find((w) => w.id === world)?.blurb} · 25 levels · easy → hard → very hard</p>
        <div class="waves-grid">
          ${list
            .map((n) => {
              const diff = difficultyFor(n)
              const open = levelOpen(save, world, n)
              const stars = starsForLevel(save, world, n)
              const secret = save.secrets.includes(levelKey(world, n))
              return `<button class="lvl ${diff} ${open ? '' : 'lock'}" data-lvl="${n}" ${open ? '' : 'disabled'}>
                <b>${n}</b>
                <span class="diff">${diff.replace('-', ' ')}</span>
                <span class="st"><b>${'★'.repeat(stars)}</b><em>${'☆'.repeat(3 - stars)}</em></span>
                ${secret ? '<i>secret</i>' : ''}
              </button>`
            })
            .join('')}
        </div>
      </div>`
  }

  const startHubSky = () => {
    const sky = host.querySelector<HTMLCanvasElement>('.waves-sky')
    if (!sky) return
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.3 + Math.random() * 0.7,
    }))
    const fleet = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random(),
      y: 0.12 + Math.random() * 0.76,
      v: 0.0012 + Math.random() * 0.0024,
      tilt: Math.random() > 0.5 ? -0.55 : 0.55,
      size: 10 + (i % 3) * 5,
      fill: ['#f4f1ff', '#6ef7ff', '#ff2f92', '#ffd166', '#c084fc'][i % 5],
      trail: [] as { x: number; y: number }[],
    }))
    const drawSky = () => {
      if (view !== 'hub') return
      raf = requestAnimationFrame(drawSky)
      const box = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sky.width = Math.max(320, Math.floor(box.width * dpr))
      sky.height = Math.max(240, Math.floor(box.height * dpr))
      const ctx = sky.getContext('2d')
      if (!ctx) return
      const w = sky.width
      const h = sky.height
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#040612')
      g.addColorStop(0.55, '#0a1028')
      g.addColorStop(1, '#14081c')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      for (const star of stars) {
        star.x += 0.00035 * star.z
        if (star.x > 1) star.x = 0
        ctx.fillStyle = `rgba(255,255,255,${0.25 + star.z * 0.7})`
        ctx.fillRect(star.x * w, star.y * h, star.z * 2.2, star.z * 2.2)
      }
      for (const ship of fleet) {
        ship.x += ship.v
        if (ship.x > 1.12) {
          ship.x = -0.12
          ship.y = 0.12 + Math.random() * 0.76
        }
        ship.trail.push({ x: ship.x, y: ship.y })
        if (ship.trail.length > 18) ship.trail.shift()
        ctx.strokeStyle = `${ship.fill}88`
        ctx.lineWidth = 3
        ctx.beginPath()
        ship.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x * w, p.y * h)
          else ctx.lineTo(p.x * w, p.y * h)
        })
        ctx.stroke()
        ctx.save()
        ctx.translate(ship.x * w, ship.y * h)
        ctx.rotate(ship.tilt)
        ctx.fillStyle = ship.fill
        ctx.beginPath()
        ctx.moveTo(ship.size, 0)
        ctx.lineTo(-ship.size * 0.7, -ship.size * 0.55)
        ctx.lineTo(-ship.size * 0.35, 0)
        ctx.lineTo(-ship.size * 0.7, ship.size * 0.55)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }
    drawSky()
  }

  const beginRun = (mode: RunMode, lvl: number, runWorld: WorldId) => {
    cancelAnimationFrame(raf)
    view = 'play'
    const track = buildTrack(runWorld, lvl, mode, save.endlessBest)
    run = {
      mode,
      world: runWorld,
      level: lvl,
      track,
      x: 0,
      y: 0.5,
      holding: false,
      started: false,
      dead: false,
      won: false,
      trail: [],
      usedSecret: false,
      ghostX: 0,
      deadAt: 0,
      boosting: false,
    }
    host.innerHTML = `
      <div class="waves-play">
        <div class="waves-hud">
          <button data-go="backplay">Back</button>
          <p data-hud></p>
          <button data-retry>Retry</button>
        </div>
        <div class="waves-stage-wrap">
          <canvas class="play-canvas"></canvas>
          <div class="waves-win" data-win hidden></div>
        </div>
      </div>`
    canvas = host.querySelector('canvas')
    loop()
  }

  const setHold = (on: boolean) => {
    if (!run) return
    if (run.won) return
    if (on && run.dead) {
      beginRun(run.mode, run.level, run.world)
      const next = run
      if (next) next.holding = true
      return
    }
    if (on) run.started = true
    run.holding = on
  }

  const showWin = (earned: number, secret: boolean, coins: number) => {
    const panel = host.querySelector<HTMLElement>('[data-win]')
    const current = run
    if (!panel || !current) return
    const worldName = worlds.find((w) => w.id === current.world)?.title || 'Space'
    let title = 'Congratulations!'
    let award = 'Finisher medal'
    if (current.mode === 'race') {
      title = 'You won the race!'
      award = 'Ghost Beater'
    } else if (earned >= 3) {
      title = 'Perfect clear!'
      award = 'Coin Master trophy'
    } else if (earned === 2) {
      title = 'Congratulations!'
      award = 'Coin Collector badge'
    }
    if (secret) award += ' · Secret Path'
    if (current.mode === 'level' && current.level === 25) {
      title = `${worldName} complete!`
      award = `${worldName} Champion`
    }
    const next = current.mode === 'level' && current.level < 25
    const stars = '★'.repeat(earned) + '☆'.repeat(Math.max(0, 3 - earned))
    panel.hidden = false
    panel.innerHTML = `
      <p class="win-kicker">${worldName} ${current.mode === 'level' ? current.level : ''}</p>
      <h3>${title}</h3>
      <p class="win-stars">${stars}</p>
      <p class="win-coins">Coins ${coins}/10</p>
      <p class="win-award">Award unlocked: ${award}</p>
      <div class="win-actions">
        ${next ? `<button data-next>Next level</button>` : ''}
        <button data-retry>Replay</button>
        <button data-go="${current.mode === 'level' ? 'levels' : 'hub'}">Levels</button>
      </div>`
  }

  const finishLevel = () => {
    if (!run) return
    const key = levelKey(run.world, run.level)
    const coins = run.track.pickups.filter((p) => p.kind === 'coin' && p.got).length
    const secret = run.track.pickups.find((p) => p.kind === 'secret')?.got ? 1 : 0
    if (secret) {
      run.usedSecret = true
      if (!save.secrets.includes(key)) save.secrets.push(key)
    }
    const earned = Math.min(3, 1 + (coins >= 5 ? 1 : 0) + (coins >= 10 ? 1 : 0))
    save.stars[key] = Math.max(save.stars[key] || 0, earned)
    if (run.mode === 'race' && run.x >= run.ghostX) save.raceWins += 1
    if (run.mode === 'endless') {
      const dist = Math.floor(run.x)
      if (dist > save.endlessBest) save.endlessBest = dist
    }
    save.skins = unlockedSkins(save)
    persist(save)
    if (run.mode !== 'endless') showWin(earned, Boolean(secret), coins)
  }

  const loop = () => {
    raf = requestAnimationFrame(loop)
    const current = run
    if (!current || !canvas) return
    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(320, Math.floor(rect.width * dpr))
    canvas.height = Math.max(240, Math.floor((rect.height - 44) * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const theme = themes[current.world]
    const shipX = 0.2
    const wallsNow = current.track.walls(current.x)

    if (!current.dead && !current.won && current.started) {
      const pace = current.track.speed * (current.boosting ? 1.55 : 1)
      current.x += pace
      current.y += current.holding ? -0.0072 : 0.0072
      if (current.mode === 'endless') {
        current.world = current.x < 40 ? 'space' : current.x < 90 ? 'lava' : 'water'
      }
      current.trail.push({ x: current.x, y: current.y })
      if (current.trail.length > 26) current.trail.shift()
      if (current.mode === 'race') current.ghostX += current.track.speed * 0.97

      const pad = 0.016
      if (current.x > 1.4) {
        if (current.y < wallsNow.top + pad || current.y > wallsNow.bot - pad) current.dead = true
        if (
          wallsNow.blockTop !== undefined &&
          wallsNow.blockBot !== undefined &&
          current.y > wallsNow.blockTop + 0.01 &&
          current.y < wallsNow.blockBot - 0.01
        ) {
          current.dead = true
        }
        for (const spike of current.track.spikes) {
          if (spikeHit(current.x, current.y, spike, current.track.walls(spike.x))) current.dead = true
        }
      }
      if (current.dead) current.deadAt = performance.now()
      for (const p of current.track.pickups) {
        if (!p.got && Math.hypot(p.x - current.x, p.y - current.y) < 0.07) p.got = true
      }
      if (current.x > current.track.secretFrom && current.x < current.track.secretTo && current.y < 0.42) {
        current.usedSecret = true
      }
      if (current.mode !== 'endless' && current.x >= current.track.length) {
        current.won = true
        finishLevel()
      }
      if (current.mode === 'endless' && Math.floor(current.x) > save.endlessBest) {
        save.endlessBest = Math.floor(current.x)
        persist(save)
      }
    } else if (current.dead && !current.won && current.deadAt && performance.now() - current.deadAt > 380) {
      const keepHold = current.holding
      current.track = buildTrack(current.world, current.level, current.mode, save.endlessBest)
      current.x = 0
      current.y = 0.5
      current.dead = false
      current.won = false
      current.deadAt = 0
      current.started = true
      current.holding = keepHold
      current.trail = []
      current.usedSecret = false
      current.ghostX = 0
    }

    ctx.fillStyle = theme.bg
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 36; i++) {
      ctx.fillStyle = i % 4 === 0 ? theme.line : '#ffffff22'
      ctx.fillRect(((i * 89 + current.x * 50) % (w + 20)) - 10, (i * 47) % h, 2, 2)
    }
    const viewLeft = current.x - shipX * 11
    const sx = (wx: number) => ((wx - viewLeft) / 11) * w

    ctx.fillStyle = theme.wall
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let t = 0; t <= 13; t += 0.12) {
      ctx.lineTo(sx(viewLeft + t), current.track.walls(viewLeft + t).top * h)
    }
    ctx.lineTo(w, 0)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let t = 0; t <= 13; t += 0.12) {
      ctx.lineTo(sx(viewLeft + t), current.track.walls(viewLeft + t).bot * h)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = theme.wall
    ctx.beginPath()
    let blocking = false
    for (let t = 0; t <= 13; t += 0.12) {
      const sample = current.track.walls(viewLeft + t)
      if (sample.blockTop === undefined || sample.blockBot === undefined) {
        if (blocking) {
          ctx.closePath()
          ctx.fill()
          ctx.beginPath()
          blocking = false
        }
        continue
      }
      const px = sx(viewLeft + t)
      if (!blocking) {
        ctx.moveTo(px, sample.blockTop * h)
        blocking = true
      }
      ctx.lineTo(px, sample.blockTop * h)
    }
    if (blocking) {
      for (let t = 13; t >= 0; t -= 0.12) {
        const sample = current.track.walls(viewLeft + t)
        if (sample.blockBot === undefined) continue
        ctx.lineTo(sx(viewLeft + t), sample.blockBot * h)
      }
      ctx.closePath()
      ctx.fill()
    }

    ctx.strokeStyle = theme.line
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let t = 0; t <= 13; t += 0.12) {
      const px = sx(viewLeft + t)
      const y = current.track.walls(viewLeft + t).top * h
      if (t === 0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
    ctx.beginPath()
    for (let t = 0; t <= 13; t += 0.12) {
      const px = sx(viewLeft + t)
      const y = current.track.walls(viewLeft + t).bot * h
      if (t === 0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()

    if (current.mode !== 'endless') {
      const finishAt = current.track.length
      const wall = current.track.walls(finishAt)
      const x0 = sx(finishAt)
      const x1 = sx(finishAt + 0.32)
      const top = wall.top * h
      const bot = wall.bot * h
      const cols = 5
      const rows = 9
      const cw = (x1 - x0) / cols
      const rh = (bot - top) / rows
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#e11d2e' : '#111111'
          ctx.fillRect(x0 + c * cw, top + r * rh, cw + 0.5, rh + 0.5)
        }
      }
    }

    for (const spike of current.track.spikes) {
      if (spike.x < viewLeft - 1 || spike.x > viewLeft + 13) continue
      const wall = current.track.walls(spike.x)
      const px = sx(spike.x)
      ctx.fillStyle = theme.spike
      ctx.beginPath()
      if (spike.fromTop) {
        ctx.moveTo(px - 12, wall.top * h)
        ctx.lineTo(px + 12, wall.top * h)
        ctx.lineTo(px, wall.top * h + 0.13 * h)
      } else {
        ctx.moveTo(px - 12, wall.bot * h)
        ctx.lineTo(px + 12, wall.bot * h)
        ctx.lineTo(px, wall.bot * h - 0.13 * h)
      }
      ctx.fill()
    }

    for (const p of current.track.pickups) {
      if (p.got) continue
      const px = sx(p.x)
      const py = p.y * h
      if (p.kind === 'secret') {
        ctx.fillStyle = '#e9a6ff'
        ctx.beginPath()
        ctx.arc(px, py, 9, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      ctx.fillStyle = '#ffd166'
      ctx.beginPath()
      ctx.arc(px, py, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff3bf'
      ctx.beginPath()
      ctx.arc(px - 3, py - 3, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }

    const skin = skins.find((s) => s.id === save.equipped) || skins[0]
    ctx.strokeStyle = skin.trail
    ctx.lineWidth = 4
    ctx.beginPath()
    current.trail.forEach((p, i) => {
      if (i === 0) ctx.moveTo(sx(p.x), p.y * h)
      else ctx.lineTo(sx(p.x), p.y * h)
    })
    ctx.stroke()

    if (current.mode === 'race') {
      const gWall = current.track.walls(current.ghostX)
      const gy = (gWall.top + gWall.bot) / 2
      ctx.fillStyle = '#d6ff4a'
      ctx.fillRect(sx(current.ghostX) - 8, gy * h - 8, 16, 16)
    }

    ctx.save()
    ctx.translate(shipX * w, current.y * h)
    ctx.rotate(current.holding ? -0.7 : 0.7)
    ctx.fillStyle = current.dead ? theme.spike : skin.fill
    ctx.beginPath()
    ctx.moveTo(16, 0)
    ctx.lineTo(-12, -10)
    ctx.lineTo(-6, 0)
    ctx.lineTo(-12, 10)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    const hud = host.querySelector('[data-hud]')
    const coinsGot = current.track.pickups.filter((p) => p.kind === 'coin' && p.got).length
    if (hud) {
      if (!current.started) hud.textContent = 'Hold to climb · right edge boosts · grab 10 coins'
      else if (current.dead) hud.textContent = 'Hit · respawning'
      else if (current.won) hud.textContent = 'Congratulations!'
      else if (current.mode === 'endless') hud.textContent = `${Math.floor(current.x)}  best ${save.endlessBest}`
      else if (current.mode === 'race') {
        hud.textContent = `Race · coins ${coinsGot}/10`
      } else {
        hud.textContent = `${worlds.find((w) => w.id === current.world)?.title} ${current.level} · coins ${coinsGot}/10`
      }
    }
  }

  const onDown = (e: PointerEvent) => {
    if (!run) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    setHold(true)
    const rect = host.getBoundingClientRect()
    if ((e.clientX - rect.left) / Math.max(1, rect.width) > 0.78) run.boosting = true
  }
  const onUp = () => {
    setHold(false)
    if (run) run.boosting = false
  }
  const onKey = (e: KeyboardEvent) => {
    if (!run) return
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
      e.preventDefault()
      setHold(true)
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'D') {
      e.preventDefault()
      run.boosting = true
      run.started = true
    }
    if (e.key === 'r' || e.key === 'R') beginRun(run.mode, run.level, run.world)
    if (e.key === 'Escape') {
      view = run.mode === 'level' ? 'world' : 'hub'
      run = null
      paintMenu()
    }
  }
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') setHold(false)
    if (!run) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'd' || e.key === 'D') run.boosting = false
  }

  const onClick = (e: Event) => {
    const t = e.target as HTMLElement
    const go = t.closest<HTMLElement>('[data-go]')?.dataset.go
    if (go === 'levels') {
      view = 'world'
      paintMenu()
    }
    if (go === 'hub' || go === 'backplay') {
      view = 'hub'
      run = null
      paintMenu()
    }
    if (go === 'skins') {
      view = 'skins'
      paintMenu()
    }
    if (go === 'endless') beginRun('endless', 1, world)
    if (go === 'race') beginRun('race', 8, world)
    const w = t.closest<HTMLElement>('[data-world]')?.dataset.world as WorldId | undefined
    if (w) {
      world = w
      paintMenu()
    }
    const lvl = t.closest<HTMLElement>('[data-lvl]')?.dataset.lvl
    if (lvl) beginRun('level', Number(lvl), world)
    if (t.closest('[data-next]') && run && run.level < 25) {
      beginRun('level', run.level + 1, run.world)
    }
    if (t.closest('[data-retry]') && run) beginRun(run.mode, run.level, run.world)
    const skinId = t.closest<HTMLElement>('[data-skin]')?.dataset.skin
    if (skinId && save.skins.includes(skinId)) {
      save.equipped = skinId
      persist(save)
      paintMenu()
    }
  }

  host.addEventListener('click', onClick)
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKeyUp)
  paintMenu()

  return () => {
    cancelAnimationFrame(raf)
    host.removeEventListener('click', onClick)
    host.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keyup', onKeyUp)
    host.classList.remove('waves-host')
    host.innerHTML = ''
  }
}
