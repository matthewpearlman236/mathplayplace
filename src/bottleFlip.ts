type Unmount = () => void

const SAVE_KEY = 'mathplayplace-bottle-flip-v1'
const LEVELS = 100
const BW = 0.52
const BH = 1.55

type SectionId = 'kitchen' | 'patio' | 'stadium'

type Plat = {
  x: number
  y: number
  w: number
  goal?: boolean
  coin?: boolean
  amp?: number
  spd?: number
}

type Save = {
  unlocked: number
  stars: Record<string, number>
  coins: number
  equipped: string
  bottles: string[]
  ach: string[]
  perfects: number
}

type Skin = { id: string; name: string; cost: number; body: string; cap: string; label: string }

const bottleSkins: Skin[] = [
  { id: 'soda', name: 'Spring', cost: 0, body: '#b9dce4', cap: '#2f7a32', label: '#1a6b3c' },
  { id: 'cola', name: 'Cola', cost: 20, body: '#6b1c14', cap: '#f4e4c1', label: '#ffd166' },
  { id: 'water', name: 'Spring Water', cost: 40, body: '#7aa2ff', cap: '#ffffff', label: '#1d4ed8' },
  { id: 'ketchup', name: 'Ketchup', cost: 70, body: '#dc2626', cap: '#f4f1ff', label: '#7f1d1d' },
  { id: 'gold', name: 'Gold Fizz', cost: 110, body: '#eab308', cap: '#fff7d6', label: '#7c4a00' },
  { id: 'neon', name: 'Neon Pop', cost: 160, body: '#ff2f92', cap: '#6ef7ff', label: '#3b0764' },
  { id: 'energy', name: 'Voltage', cost: 220, body: '#84cc16', cap: '#022c22', label: '#ecfccb' },
  { id: 'crystal', name: 'Crystal', cost: 300, body: '#c4d4ff', cap: '#f8fafc', label: '#6ef7ff' },
]

const achievementList = [
  { id: 'first', name: 'First Flip', hint: 'Beat Kitchen 1' },
  { id: 'stairs', name: 'Stair Climber', hint: 'Beat Kitchen 3' },
  { id: 'kitchen', name: 'Kitchen Closed', hint: 'Beat all 33 easy levels' },
  { id: 'patio', name: 'Patio Pro', hint: 'Beat Patio (level 67)' },
  { id: 'stadium', name: 'Stadium Champ', hint: 'Beat all 100 levels' },
  { id: 'perfect5', name: 'Clean Five', hint: '3★ on 5 levels' },
  { id: 'perfect20', name: 'Table Legend', hint: '3★ on 20 levels' },
  { id: 'coins50', name: 'Pocket Change', hint: 'Hold 50 coins' },
  { id: 'coins150', name: 'Coin Fridge', hint: 'Hold 150 coins' },
  { id: 'air', name: 'Air Combo', hint: 'Tap 5 times in one flip' },
  { id: 'bottles4', name: 'Mini Fridge', hint: 'Unlock 4 bottle skins' },
  { id: 'bottlesAll', name: 'Full Shelf', hint: 'Unlock every bottle' },
]

type Run = {
  n: number
  plats: Plat[]
  cx: number
  cy: number
  vx: number
  vy: number
  rot: number
  spin: number
  grounded: boolean
  on: number
  flips: number
  airTaps: number
  coinsGot: number
  dead: boolean
  won: boolean
  deadAt: number
  lastTap: number
  t: number
}

const sections: { id: SectionId; title: string; emoji: string; from: number; to: number; blurb: string }[] = [
  { id: 'kitchen', title: 'Kitchen', emoji: '🍽️', from: 1, to: 33, blurb: 'Easy flips on wide tables and short stairs.' },
  { id: 'patio', title: 'Patio', emoji: '🌇', from: 34, to: 67, blurb: 'Tighter landings, taller steps, longer gaps.' },
  { id: 'stadium', title: 'Stadium', emoji: '🏟️', from: 68, to: 100, blurb: 'Tiny ledges, moving stands, the hardest flips.' },
]

function sectionOf(n: number) {
  return sections.find((s) => n >= s.from && n <= s.to) || sections[0]
}

function loadSave(): Save {
  const blank: Save = {
    unlocked: 1,
    stars: {},
    coins: 0,
    equipped: 'soda',
    bottles: ['soda'],
    ach: [],
    perfects: 0,
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return blank
    const data = JSON.parse(raw) as Partial<Save>
    return {
      ...blank,
      ...data,
      bottles: data.bottles?.length ? data.bottles : ['soda'],
      ach: data.ach || [],
      equipped: data.equipped || 'soda',
    }
  } catch {
    return blank
  }
}

function grantAch(save: Save, extra?: { airCombo?: boolean }) {
  const have = new Set(save.ach)
  const beat = (n: number) => save.unlocked > n || (save.stars[String(n)] || 0) > 0
  const checks: [string, boolean][] = [
    ['first', beat(1)],
    ['stairs', beat(3)],
    ['kitchen', beat(33)],
    ['patio', beat(67)],
    ['stadium', beat(100)],
    ['perfect5', save.perfects >= 5],
    ['perfect20', save.perfects >= 20],
    ['coins50', save.coins >= 50],
    ['coins150', save.coins >= 150],
    ['air', Boolean(extra?.airCombo) || have.has('air')],
    ['bottles4', save.bottles.length >= 4],
    ['bottlesAll', save.bottles.length >= bottleSkins.length],
  ]
  for (const [id, ok] of checks) {
    if (ok && !have.has(id)) save.ach.push(id)
  }
}

function skinOf(id: string) {
  return bottleSkins.find((b) => b.id === id) || bottleSkins[0]
}

function persist(save: Save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

function rng(seed: number) {
  let s = (seed * 1103515245 + 12345) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function buildLevel(n: number): Plat[] {
  if (n === 1) {
    return [
      { x: 1.4, y: 9.2, w: 4.2 },
      { x: 7.6, y: 9.2, w: 4.2, goal: true },
    ]
  }
  if (n === 2) {
    return [
      { x: 1.2, y: 9.5, w: 4.6 },
      { x: 6.5, y: 9.15, w: 4.4, coin: true },
      { x: 11.6, y: 8.8, w: 4.6, goal: true },
    ]
  }
  if (n === 3) {
    return [
      { x: 1.2, y: 9.8, w: 4.2 },
      { x: 6.0, y: 9.3, w: 2.8 },
      { x: 9.2, y: 8.8, w: 2.8, coin: true },
      { x: 12.4, y: 8.4, w: 4.2, goal: true },
    ]
  }

  const r = rng(n * 7919 + 17)
  const sec = n <= 33 ? 0 : n <= 67 ? 1 : 2
  const count = (sec === 0 ? 3 : sec === 1 ? 4 : 5) + (n % 3)
  const baseW = sec === 0 ? 4.3 : sec === 1 ? 3.7 : 3.2
  const gap = 0.45 + sec * 0.18
  const plats: Plat[] = []
  let x = 1.2
  let y = 9.8

  for (let i = 0; i < count; i++) {
    const last = i === count - 1
    const stair = !last && r() > (sec === 0 ? 0.72 : 0.62)
    if (stair) {
      const steps = 2 + Math.floor(r() * 2)
      const stepW = Math.max(2.2, baseW * 0.62)
      for (let s = 0; s < steps; s++) {
        x += stepW * 0.82
        y -= 0.32 + sec * 0.08
        plats.push({ x, y, w: stepW, coin: s === steps - 1 && r() > 0.35 })
      }
      continue
    }
    if (i > 0) {
      x += baseW + gap
      y += (r() - 0.5) * (0.45 + sec * 0.2)
      y = Math.max(6.4, Math.min(10.6, y))
    }
    const w = last ? baseW + 0.8 : baseW
    const plat: Plat = { x, y, w, goal: last, coin: !last && i > 0 && r() > 0.42 }
    if (sec === 2 && !last && r() > 0.78) {
      plat.amp = 0.22 + r() * 0.2
      plat.spd = 0.7 + r() * 0.4
    }
    plats.push(plat)
  }
  return plats
}

function platX(p: Plat, t: number) {
  return p.x + (p.amp ? Math.sin(t * (p.spd || 1)) * p.amp : 0)
}

export function springBottleSkin(): Skin {
  return bottleSkins[0]
}

export function drawFlipBottle(
  ctx: CanvasRenderingContext2D,
  bw: number,
  bh: number,
  skin: Skin,
  dead: boolean,
) {
  const top = -bh / 2
  const capH = bh * 0.1
  const neckW = bw * 0.36
  const neckH = bh * 0.12
  const bodyTop = top + capH + neckH * 0.85
  const bodyH = bh * 0.78
  const clear = skin.id === 'soda' || skin.id === 'water' || skin.id === 'crystal'
  const body = dead ? '#ff8aa8' : skin.body
  const cap = dead ? '#c81e4a' : skin.cap

  ctx.fillStyle = cap
  ctx.beginPath()
  ctx.moveTo(-neckW * 0.72, top + capH * 0.35)
  ctx.quadraticCurveTo(-neckW * 0.72, top, 0, top)
  ctx.quadraticCurveTo(neckW * 0.72, top, neckW * 0.72, top + capH * 0.35)
  ctx.lineTo(neckW * 0.72, top + capH)
  ctx.lineTo(-neckW * 0.72, top + capH)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = dead ? '#7f1d1d' : '#1e4d22'
  ctx.lineWidth = Math.max(1, bw * 0.04)
  for (let i = 1; i <= 3; i++) {
    const y = top + capH * (0.28 + i * 0.18)
    ctx.beginPath()
    ctx.moveTo(-neckW * 0.62, y)
    ctx.lineTo(neckW * 0.62, y)
    ctx.stroke()
  }

  ctx.fillStyle = clear ? (dead ? '#ffd0da' : 'rgba(190, 226, 234, 0.92)') : body
  ctx.fillRect(-neckW / 2, top + capH * 0.92, neckW, neckH)

  ctx.beginPath()
  ctx.moveTo(-bw * 0.38, bodyTop)
  ctx.quadraticCurveTo(-bw / 2, bodyTop + bodyH * 0.07, -bw / 2, bodyTop + bodyH * 0.16)
  ctx.lineTo(-bw / 2, bodyTop + bodyH * 0.84)
  ctx.quadraticCurveTo(-bw / 2, bodyTop + bodyH, -bw * 0.26, bodyTop + bodyH)
  ctx.lineTo(bw * 0.26, bodyTop + bodyH)
  ctx.quadraticCurveTo(bw / 2, bodyTop + bodyH, bw / 2, bodyTop + bodyH * 0.84)
  ctx.lineTo(bw / 2, bodyTop + bodyH * 0.16)
  ctx.quadraticCurveTo(bw / 2, bodyTop + bodyH * 0.07, bw * 0.38, bodyTop)
  ctx.closePath()
  ctx.fillStyle = clear ? (dead ? '#ffb0c4' : 'rgba(176, 214, 222, 0.88)') : body
  ctx.fill()
  ctx.save()
  ctx.clip()

  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.beginPath()
  ctx.moveTo(-bw * 0.34, bodyTop + bodyH * 0.12)
  ctx.lineTo(-bw * 0.22, bodyTop + bodyH * 0.12)
  ctx.lineTo(-bw * 0.26, bodyTop + bodyH * 0.72)
  ctx.lineTo(-bw * 0.36, bodyTop + bodyH * 0.72)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(70, 110, 120, 0.22)'
  ctx.lineWidth = Math.max(1, bw * 0.025)
  for (let i = 0; i < 4; i++) {
    const y = bodyTop + bodyH * (0.64 + i * 0.055)
    ctx.beginPath()
    ctx.moveTo(-bw * 0.46, y)
    ctx.quadraticCurveTo(0, y + bw * 0.04, bw * 0.46, y)
    ctx.stroke()
  }

  const ly = bodyTop + bodyH * 0.2
  const lh = bodyH * 0.34
  const lw = bw * 0.92
  ctx.fillStyle = skin.label
  ctx.fillRect(-lw / 2, ly, lw, lh)
  if (skin.id === 'soda') {
    ctx.fillStyle = '#2f8f4a'
    ctx.fillRect(-lw / 2, ly, lw, lh * 0.42)
    ctx.fillStyle = '#6fb56a'
    ctx.beginPath()
    ctx.moveTo(-lw / 2, ly + lh * 0.48)
    ctx.lineTo(-lw * 0.18, ly + lh * 0.1)
    ctx.lineTo(0, ly + lh * 0.38)
    ctx.lineTo(lw * 0.16, ly + lh * 0.14)
    ctx.lineTo(lw / 2, ly + lh * 0.48)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#eef6dc'
    ctx.beginPath()
    ctx.ellipse(0, ly + lh * 0.55, lw * 0.24, lh * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a5c32'
    ctx.font = `700 ${Math.max(8, Math.floor(lh * 0.28))}px IBM Plex Sans, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SPRING', 0, ly + lh * 0.56)
  } else {
    ctx.fillStyle = skin.cap
    ctx.fillRect(-lw * 0.2, ly + lh * 0.28, lw * 0.4, lh * 0.44)
  }
  ctx.restore()
  ctx.strokeStyle = clear ? 'rgba(90, 130, 140, 0.35)' : 'rgba(0,0,0,0.18)'
  ctx.lineWidth = Math.max(1, bw * 0.03)
  ctx.beginPath()
  ctx.moveTo(-bw * 0.38, bodyTop)
  ctx.quadraticCurveTo(-bw / 2, bodyTop + bodyH * 0.07, -bw / 2, bodyTop + bodyH * 0.16)
  ctx.lineTo(-bw / 2, bodyTop + bodyH * 0.84)
  ctx.quadraticCurveTo(-bw / 2, bodyTop + bodyH, -bw * 0.26, bodyTop + bodyH)
  ctx.lineTo(bw * 0.26, bodyTop + bodyH)
  ctx.quadraticCurveTo(bw / 2, bodyTop + bodyH, bw / 2, bodyTop + bodyH * 0.84)
  ctx.lineTo(bw / 2, bodyTop + bodyH * 0.16)
  ctx.quadraticCurveTo(bw / 2, bodyTop + bodyH * 0.07, bw * 0.38, bodyTop)
  ctx.closePath()
  ctx.stroke()
}

export function mountBottleFlip(host: HTMLElement): Unmount {
  let save = loadSave()
  grantAch(save)
  persist(save)
  let view: 'hub' | 'list' | 'ach' | 'bottles' | 'play' = 'hub'
  let section: SectionId = 'kitchen'
  let run: Run | null = null
  let raf = 0
  let canvas: HTMLCanvasElement | null = null
  host.classList.add('flip-host')

  const paintMenu = () => {
    cancelAnimationFrame(raf)
    canvas = null
    if (view === 'hub') {
      const stars = Object.values(save.stars).reduce((a, b) => a + b, 0)
      host.innerHTML = `
        <div class="flip-hub">
          <div class="waves-menu">
            <p class="waves-kicker">Bottle Flip Master</p>
            <h2>Kitchen, patio, stadium</h2>
            <p class="waves-sub">${stars} stars · ${save.coins} coins · ${save.ach.length}/${achievementList.length} achievements</p>
            <div class="waves-modes">
              <button class="mode-sq" data-go="list"><span>▦</span>Levels</button>
              <button class="mode-sq" data-go="ach"><span>🏆</span>Achievements</button>
              <button class="mode-sq" data-go="bottles"><span>🍾</span>Bottles</button>
            </div>
            <p class="waves-help">Tap to flip. Grab coins. Unlock bottle skins. Land upright on every table and stair.</p>
          </div>
        </div>`
      return
    }
    if (view === 'ach') {
      host.innerHTML = `
        <div class="waves-menu">
          <button class="waves-back" data-go="hub">← Menu</button>
          <h2>Achievements</h2>
          <p class="waves-sub">${save.ach.length} / ${achievementList.length} unlocked</p>
          <div class="flip-achs">
            ${achievementList
              .map((a) => {
                const on = save.ach.includes(a.id)
                return `<article class="ach-row ${on ? 'on' : ''}">
                  <strong>${on ? '🏆' : '🔒'} ${a.name}</strong>
                  <span>${on ? 'Unlocked' : a.hint}</span>
                </article>`
              })
              .join('')}
          </div>
        </div>`
      return
    }
    if (view === 'bottles') {
      host.innerHTML = `
        <div class="waves-menu">
          <button class="waves-back" data-go="hub">← Menu</button>
          <h2>Bottles</h2>
          <p class="waves-sub">${save.coins} coins · earn more in levels, then unlock skins</p>
          <div class="waves-skins">
            ${bottleSkins
              .map((b) => {
                const have = save.bottles.includes(b.id)
                const can = have || save.coins >= b.cost
                const eq = save.equipped === b.id
                return `<button class="skin-card ${eq ? 'eq' : ''}" data-bottle="${b.id}" ${can ? '' : 'disabled'}>
                  <span class="skin-chip" style="background:${b.body}"></span>
                  <strong>${b.name}</strong>
                  <em>${have ? (eq ? 'Equipped' : 'Owned · tap to use') : can ? `Unlock · ${b.cost} coins` : `${b.cost} coins`}</em>
                </button>`
              })
              .join('')}
          </div>
        </div>`
      return
    }
    const sec = sections.find((s) => s.id === section) || sections[0]
    const list = Array.from({ length: sec.to - sec.from + 1 }, (_, i) => sec.from + i)
    host.innerHTML = `
      <div class="waves-menu">
        <button class="waves-back" data-go="hub">← Menu</button>
        <div class="waves-worlds">
          ${sections
            .map(
              (s) =>
                `<button class="${s.id === section ? 'on' : ''}" data-sec="${s.id}" ${
                  save.unlocked < s.from ? 'disabled' : ''
                }>${s.emoji} ${s.title}</button>`,
            )
            .join('')}
        </div>
        <p class="waves-sub">${sec.blurb} · levels ${sec.from}–${sec.to}</p>
        <div class="waves-grid">
          ${list
            .map((n) => {
              const lock = n > save.unlocked
              const st = save.stars[String(n)] || 0
              const band = n <= 33 ? 'easy' : n <= 67 ? 'hard' : 'very-hard'
              const label = n <= 33 ? 'easy' : n <= 67 ? 'hard' : 'very hard'
              return `<button class="lvl ${band} ${lock ? 'lock' : ''}" data-lvl="${n}" ${lock ? 'disabled' : ''}>
                <b>${n}</b>
                <i>${label}</i>
                <span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>
              </button>`
            })
            .join('')}
        </div>
      </div>`
  }

  const spawn = (n: number) => {
    const plats = buildLevel(n)
    const start = plats[0]
    run = {
      n,
      plats,
      cx: start.x + Math.max(BW * 1.2, start.w * 0.62),
      cy: start.y - BH / 2,
      vx: 0,
      vy: 0,
      rot: 0,
      spin: 0,
      grounded: true,
      on: 0,
      flips: 0,
      airTaps: 0,
      coinsGot: 0,
      dead: false,
      won: false,
      deadAt: 0,
      lastTap: -1,
      t: 0,
    }
  }

  const begin = (n: number) => {
    view = 'play'
    spawn(n)
    host.innerHTML = `
      <div class="flip-play">
        <div class="waves-hud">
          <button data-go="list">Back</button>
          <p data-hud></p>
          <button data-retry>Retry</button>
        </div>
        <canvas class="play-canvas"></canvas>
        <div class="waves-win" data-win hidden></div>
      </div>`
    canvas = host.querySelector('canvas')
    loop()
  }

  const tap = () => {
    const cur = run
    if (!cur || cur.dead || cur.won) return
    const now = cur.t
    if (now - cur.lastTap < 0.08) return
    cur.lastTap = now
    const sec = cur.n <= 33 ? 0 : cur.n <= 67 ? 1 : 2
    if (cur.grounded) {
      cur.grounded = false
      cur.airTaps = 1
      cur.vy = -9.6 - sec * 0.25
      cur.vx = 3.8 + sec * 0.28
      cur.spin = 4.2 + sec * 0.45
      cur.flips += 1
      return
    }
    cur.airTaps += 1
    cur.spin += 2.2 + sec * 0.35
    cur.vy -= 1.05
    cur.vx += 0.18
    cur.flips += 1
    if (cur.airTaps >= 5) {
      grantAch(save, { airCombo: true })
      persist(save)
    }
  }

  const fail = () => {
    const cur = run
    if (!cur || cur.dead || cur.won) return
    cur.dead = true
    cur.deadAt = cur.t
  }

  const win = () => {
    const cur = run
    if (!cur || cur.won) return
    cur.won = true
    cur.grounded = true
    cur.vx = 0
    cur.vy = 0
    cur.spin = 0
    cur.rot = 0
    const budget = cur.plats.length + (cur.n <= 33 ? 4 : cur.n <= 67 ? 2 : 0)
    const stars = cur.flips <= cur.plats.length ? 3 : cur.flips <= budget ? 2 : 1
    const key = String(cur.n)
    save.stars[key] = Math.max(save.stars[key] || 0, stars)
    if (stars === 3 && (save.stars[key] || 0) <= 3) save.perfects = Object.values(save.stars).filter((s) => s >= 3).length
    const bonus = 4 + stars * 2
    save.coins += bonus
    if (cur.n >= save.unlocked) save.unlocked = Math.min(LEVELS, cur.n + 1)
    grantAch(save)
    persist(save)
    const panel = host.querySelector<HTMLElement>('[data-win]')
    if (!panel) return
    panel.hidden = false
    const sec = sectionOf(cur.n)
    panel.innerHTML = `
      <p class="win-kicker">${sec.title} ${cur.n}</p>
      <h3>Clean landing!</h3>
      <p class="win-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
      <p class="win-coins">${cur.flips} flips · +${bonus + cur.coinsGot} coins</p>
      <p class="win-award">Award: ${stars === 3 ? 'Perfect Flip' : stars === 2 ? 'Table Ace' : 'Upright Finish'}</p>
      <div class="win-actions">
        ${cur.n < LEVELS ? '<button data-next>Next level</button>' : ''}
        <button data-retry>Replay</button>
        <button data-go="list">Levels</button>
      </div>`
  }

  const loop = () => {
    raf = requestAnimationFrame(loop)
    const cur = run
    if (!cur || !canvas) return
    const dt = 1 / 60
    cur.t += dt
    if (cur.dead && cur.t - cur.deadAt > 0.42) {
      spawn(cur.n)
      const panel = host.querySelector<HTMLElement>('[data-win]')
      if (panel) panel.hidden = true
    }

    if (!cur.dead && !cur.won) {
      if (!cur.grounded) {
        cur.vy += 18 * dt
        cur.cx += cur.vx * dt
        cur.cy += cur.vy * dt
        cur.rot += cur.spin * dt
        cur.vx *= 0.999
      }

      const cos = Math.cos(cur.rot)
      const sin = Math.sin(cur.rot)
      const corners = [
        [-BW / 2, -BH / 2],
        [BW / 2, -BH / 2],
        [BW / 2, BH / 2],
        [-BW / 2, BH / 2],
      ].map(([px, py]) => ({ x: cur.cx + px * cos - py * sin, y: cur.cy + px * sin + py * cos }))
      const lowest = Math.max(...corners.map((c) => c.y))
      const left = Math.min(...corners.map((c) => c.x))
      const right = Math.max(...corners.map((c) => c.x))

      if (!cur.grounded) {
        let hit = -1
        for (let i = 0; i < cur.plats.length; i++) {
          const p = cur.plats[i]
          const px = platX(p, cur.t)
          if (right < px - 0.08 || left > px + p.w + 0.08) continue
          if (lowest >= p.y - 0.22 && lowest <= p.y + 0.7 && cur.vy > -1.2) {
            hit = i
            break
          }
        }
        if (hit >= 0) {
          const p = cur.plats[hit]
          cur.grounded = true
          cur.on = hit
          cur.rot = 0
          cur.spin = 0
          cur.vx = 0
          cur.vy = 0
          cur.cy = p.y - BH / 2
          cur.cx = Math.max(platX(p, cur.t) + BW, Math.min(platX(p, cur.t) + p.w - BW, cur.cx))
          if (p.goal) win()
        }
      } else {
        const p = cur.plats[cur.on]
        if (p) {
          cur.cy = p.y - BH / 2
          if (p.amp) cur.cx += (platX(p, cur.t) - platX(p, cur.t - dt)) * 0.9
        }
      }

      for (const p of cur.plats) {
        if (!p.coin) continue
        const px = platX(p, cur.t) + p.w / 2
        const py = p.y - 0.85
        if (Math.hypot(cur.cx - px, cur.cy - py) < 0.72) {
          p.coin = false
          cur.coinsGot += 1
          save.coins += 1
          grantAch(save)
          persist(save)
        }
      }

      const floor = Math.max(...cur.plats.map((p) => p.y)) + 3.5
      if (cur.cy > floor) fail()
    }

    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(280, Math.floor(rect.width * dpr))
    canvas.height = Math.max(180, Math.floor((rect.height - 48) * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const sec = sectionOf(cur.n)
    const bg = sec.id === 'kitchen' ? '#24140e' : sec.id === 'patio' ? '#10182a' : '#0a1020'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)

    const lookX = cur.cx + 2.4
    const lookY = cur.cy - 1.2
    const scale = Math.min(w, h) / 14.5
    const camX = lookX * scale - w * 0.42
    const camY = lookY * scale - h * 0.55
    const sx = (x: number) => x * scale - camX
    const sy = (y: number) => y * scale - camY

    ctx.fillStyle = sec.id === 'kitchen' ? '#3a2218' : '#152038'
    ctx.fillRect(0, sy(Math.max(...cur.plats.map((p) => p.y)) + 0.9), w, h)

    for (const p of cur.plats) {
      const px = platX(p, cur.t)
      ctx.fillStyle = p.goal ? '#2dd4a0' : sec.id === 'stadium' ? '#334155' : '#8b5a2b'
      ctx.fillRect(sx(px), sy(p.y), p.w * scale, 0.32 * scale)
      ctx.fillStyle = p.goal ? '#bbf7d0' : '#d6b48a'
      ctx.fillRect(sx(px), sy(p.y), p.w * scale, 0.08 * scale)
      if (p.goal) {
        ctx.fillStyle = '#f4f1ff'
        ctx.font = `${Math.floor(0.45 * scale)}px Syne, sans-serif`
        ctx.fillText('GOAL', sx(px + 0.2), sy(p.y) - 8)
      }
      if (p.coin) {
        ctx.fillStyle = '#ffd166'
        ctx.beginPath()
        ctx.arc(sx(px + p.w / 2), sy(p.y - 0.85), 0.22 * scale, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const skin = skinOf(save.equipped)
    ctx.save()
    ctx.translate(sx(cur.cx), sy(cur.cy))
    ctx.rotate(cur.rot)
    drawFlipBottle(ctx, BW * scale, BH * scale * 1.12, skin, cur.dead)
    ctx.restore()

    const hud = host.querySelector('[data-hud]')
    if (hud) {
      if (cur.dead) hud.textContent = 'Wobble · flipping again'
      else if (cur.won) hud.textContent = 'Landed!'
      else hud.textContent = `${sec.title} ${cur.n} · ${cur.flips} flips · ${save.coins} coins`
    }
  }

  const onClick = (e: Event) => {
    const t = e.target as HTMLElement
    const sec = t.closest<HTMLElement>('[data-sec]')?.dataset.sec as SectionId | undefined
    if (sec) {
      if (save.unlocked < (sections.find((s) => s.id === sec)?.from || 1)) return
      section = sec
      view = 'list'
      paintMenu()
      return
    }
    if (t.closest('[data-go="hub"]')) {
      view = 'hub'
      run = null
      paintMenu()
      return
    }
    if (t.closest('[data-go="list"]')) {
      view = 'list'
      run = null
      paintMenu()
      return
    }
    if (t.closest('[data-go="ach"]')) {
      view = 'ach'
      paintMenu()
      return
    }
    if (t.closest('[data-go="bottles"]')) {
      view = 'bottles'
      paintMenu()
      return
    }
    const bottle = t.closest<HTMLElement>('[data-bottle]')?.dataset.bottle
    if (bottle) {
      const skin = skinOf(bottle)
      if (!save.bottles.includes(bottle)) {
        if (save.coins < skin.cost) return
        save.bottles.push(bottle)
      }
      save.equipped = bottle
      grantAch(save)
      persist(save)
      paintMenu()
      return
    }
    const lvl = t.closest<HTMLElement>('[data-lvl]')?.dataset.lvl
    if (lvl) begin(Number(lvl))
    if (t.closest('[data-retry]') && run) begin(run.n)
    if (t.closest('[data-next]') && run && run.n < LEVELS) begin(run.n + 1)
  }

  const onPtr = (e: PointerEvent) => {
    if (!run || view !== 'play') return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    tap()
  }
  const onKey = (e: KeyboardEvent) => {
    if (!run) return
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      tap()
    }
    if (e.key === 'r' || e.key === 'R') begin(run.n)
  }

  host.addEventListener('click', onClick)
  host.addEventListener('pointerdown', onPtr)
  window.addEventListener('keydown', onKey)
  paintMenu()

  return () => {
    cancelAnimationFrame(raf)
    host.removeEventListener('click', onClick)
    host.removeEventListener('pointerdown', onPtr)
    window.removeEventListener('keydown', onKey)
    host.classList.remove('flip-host')
    host.innerHTML = ''
  }
}
