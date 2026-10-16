type Unmount = () => void

const SAVE_KEY = 'mathplayplace-football-bros-v1'
const PLAYERS = 9
const FIELD_W = 53
const FIELD_L = 120
const EZ = 10
const HALF_TIME = 55
const COIN_WIN = 10
const STREAK_NEEDED = 10
const SB_TROPHIES = 2

export type FbMode = 'ais' | 'competitive' | 'people'

type Team = {
  id: string
  city: string
  name: string
  abbr: string
  primary: string
  secondary: string
  conf: 'AFC' | 'NFC'
}

type Save = {
  coins: number
  trophies: number
  superBowls: number
  team: string
  speed: number
  strength: number
  arm: number
  hands: number
  streak: Record<FbMode, number>
  bestStreak: number
}

type Athlete = {
  x: number
  y: number
  vx: number
  vy: number
  role: string
  num: number
  off: boolean
  mine: boolean
}

type Ball = { x: number; y: number; vx: number; vy: number; hold: number; air: boolean }

type Match = {
  mode: FbMode
  mine: Team
  foe: Team
  gameN: number
  half: number
  clock: number
  homeScore: number
  awayScore: number
  los: number
  down: number
  toGo: number
  dir: number
  state: 'presnap' | 'live' | 'dead' | 'half' | 'over'
  deadT: number
  snapT: number
  t: number
  offMine: boolean
  ball: Ball
  squad: Athlete[]
  ctrl: number
  ctrl2: number
  playClock: number
  msg: string
  result?: 'win' | 'loss'
}

const nfl: Team[] = [
  { id: 'buf', city: 'Buffalo', name: 'Bills', abbr: 'BUF', primary: '#00338d', secondary: '#c60c30', conf: 'AFC' },
  { id: 'mia', city: 'Miami', name: 'Dolphins', abbr: 'MIA', primary: '#008e97', secondary: '#fc4c02', conf: 'AFC' },
  { id: 'ne', city: 'New England', name: 'Patriots', abbr: 'NE', primary: '#002244', secondary: '#c60c30', conf: 'AFC' },
  { id: 'nyj', city: 'New York', name: 'Jets', abbr: 'NYJ', primary: '#125740', secondary: '#ffffff', conf: 'AFC' },
  { id: 'bal', city: 'Baltimore', name: 'Ravens', abbr: 'BAL', primary: '#241773', secondary: '#9e7c0c', conf: 'AFC' },
  { id: 'cin', city: 'Cincinnati', name: 'Bengals', abbr: 'CIN', primary: '#fb4f14', secondary: '#000000', conf: 'AFC' },
  { id: 'cle', city: 'Cleveland', name: 'Browns', abbr: 'CLE', primary: '#311d00', secondary: '#ff3c00', conf: 'AFC' },
  { id: 'pit', city: 'Pittsburgh', name: 'Steelers', abbr: 'PIT', primary: '#ffb612', secondary: '#101820', conf: 'AFC' },
  { id: 'hou', city: 'Houston', name: 'Texans', abbr: 'HOU', primary: '#03202f', secondary: '#a71930', conf: 'AFC' },
  { id: 'ind', city: 'Indianapolis', name: 'Colts', abbr: 'IND', primary: '#002c5f', secondary: '#a2aaad', conf: 'AFC' },
  { id: 'jax', city: 'Jacksonville', name: 'Jaguars', abbr: 'JAX', primary: '#006778', secondary: '#d7a22a', conf: 'AFC' },
  { id: 'ten', city: 'Tennessee', name: 'Titans', abbr: 'TEN', primary: '#0c2340', secondary: '#4b92db', conf: 'AFC' },
  { id: 'den', city: 'Denver', name: 'Broncos', abbr: 'DEN', primary: '#002244', secondary: '#fb4f14', conf: 'AFC' },
  { id: 'kc', city: 'Kansas City', name: 'Chiefs', abbr: 'KC', primary: '#e31837', secondary: '#ffb81c', conf: 'AFC' },
  { id: 'lv', city: 'Las Vegas', name: 'Raiders', abbr: 'LV', primary: '#000000', secondary: '#a5acaf', conf: 'AFC' },
  { id: 'lac', city: 'Los Angeles', name: 'Chargers', abbr: 'LAC', primary: '#0080c6', secondary: '#ffc20e', conf: 'AFC' },
  { id: 'dal', city: 'Dallas', name: 'Cowboys', abbr: 'DAL', primary: '#003594', secondary: '#869397', conf: 'NFC' },
  { id: 'nyg', city: 'New York', name: 'Giants', abbr: 'NYG', primary: '#0b2265', secondary: '#a71930', conf: 'NFC' },
  { id: 'phi', city: 'Philadelphia', name: 'Eagles', abbr: 'PHI', primary: '#004c54', secondary: '#a5acaf', conf: 'NFC' },
  { id: 'was', city: 'Washington', name: 'Commanders', abbr: 'WAS', primary: '#5a1414', secondary: '#ffb612', conf: 'NFC' },
  { id: 'chi', city: 'Chicago', name: 'Bears', abbr: 'CHI', primary: '#0b162a', secondary: '#c83803', conf: 'NFC' },
  { id: 'det', city: 'Detroit', name: 'Lions', abbr: 'DET', primary: '#0076b6', secondary: '#b0b7bc', conf: 'NFC' },
  { id: 'gb', city: 'Green Bay', name: 'Packers', abbr: 'GB', primary: '#203731', secondary: '#ffb612', conf: 'NFC' },
  { id: 'min', city: 'Minnesota', name: 'Vikings', abbr: 'MIN', primary: '#4f2683', secondary: '#ffc62f', conf: 'NFC' },
  { id: 'atl', city: 'Atlanta', name: 'Falcons', abbr: 'ATL', primary: '#a71930', secondary: '#000000', conf: 'NFC' },
  { id: 'car', city: 'Carolina', name: 'Panthers', abbr: 'CAR', primary: '#0085ca', secondary: '#101820', conf: 'NFC' },
  { id: 'no', city: 'New Orleans', name: 'Saints', abbr: 'NO', primary: '#d3bc8d', secondary: '#101820', conf: 'NFC' },
  { id: 'tb', city: 'Tampa Bay', name: 'Buccaneers', abbr: 'TB', primary: '#d50a0a', secondary: '#34302b', conf: 'NFC' },
  { id: 'ari', city: 'Arizona', name: 'Cardinals', abbr: 'ARI', primary: '#97233f', secondary: '#000000', conf: 'NFC' },
  { id: 'lar', city: 'Los Angeles', name: 'Rams', abbr: 'LAR', primary: '#003594', secondary: '#ffa300', conf: 'NFC' },
  { id: 'sf', city: 'San Francisco', name: '49ers', abbr: 'SF', primary: '#aa0000', secondary: '#b3995d', conf: 'NFC' },
  { id: 'sea', city: 'Seattle', name: 'Seahawks', abbr: 'SEA', primary: '#002244', secondary: '#69be28', conf: 'NFC' },
]

const offRoles = ['QB', 'RB', 'WR', 'WR', 'TE', 'LT', 'C', 'RT', 'SL']
const defRoles = ['DE', 'NT', 'DE', 'OLB', 'MLB', 'OLB', 'CB', 'CB', 'S']
const shopKeys = ['speed', 'strength', 'arm', 'hands'] as const
const shopLabels: Record<(typeof shopKeys)[number], string> = {
  speed: 'Speed',
  strength: 'Strength',
  arm: 'Arm',
  hands: 'Hands',
}

function blankSave(): Save {
  return {
    coins: 0,
    trophies: 0,
    superBowls: 0,
    team: 'nyg',
    speed: 0,
    strength: 0,
    arm: 0,
    hands: 0,
    streak: { ais: 0, competitive: 0, people: 0 },
    bestStreak: 0,
  }
}

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return blankSave()
    const data = JSON.parse(raw) as Partial<Save>
    return {
      ...blankSave(),
      ...data,
      streak: { ...blankSave().streak, ...data.streak },
    }
  } catch {
    return blankSave()
  }
}

function persist(save: Save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

function teamById(id: string) {
  return nfl.find((t) => t.id === id) || nfl[17]
}

function pickFoe(mine: Team, gameN: number) {
  if (mine.id === 'nyg' && gameN === 1) return teamById('tb')
  const i = nfl.findIndex((t) => t.id === mine.id)
  return nfl[(i + 5 + gameN * 7) % nfl.length] === mine ? nfl[(i + 11) % nfl.length] : nfl[(i + 5 + gameN * 7) % nfl.length]
}

function rosterBoost(save: Save) {
  return Math.min(3, Math.floor(save.trophies / 2))
}

function rosterName(save: Save) {
  return ['Rookies', 'Starters', 'All-Pros', 'Hall of Fame'][rosterBoost(save)]
}

function shopCost(level: number) {
  return [15, 30, 55, 90, 140][level] || 999
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function difficulty(mode: FbMode, gameN: number) {
  const base = mode === 'competitive' ? 0.62 : mode === 'people' ? 0.45 : 0.38
  return clamp(base + (gameN - 1) * 0.045, 0.3, 0.98)
}

export function drawFootballCover(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#14532d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#166534'
  for (let i = 0; i < 6; i++) ctx.fillRect(0, (i / 6) * h, w, h / 12)
  ctx.strokeStyle = '#f4f1ffcc'
  ctx.lineWidth = Math.max(1, w * 0.008)
  ctx.beginPath()
  ctx.moveTo(w * 0.12, 0)
  ctx.lineTo(w * 0.12, h)
  ctx.moveTo(w * 0.88, 0)
  ctx.lineTo(w * 0.88, h)
  ctx.stroke()
  const run = (t * 0.9) % 1
  const guys = [
    { x: 0.22 + run * 0.5, y: 0.42, c: '#0b2265' },
    { x: 0.18 + run * 0.5, y: 0.62, c: '#0b2265' },
    { x: 0.48 + run * 0.38, y: 0.5, c: '#d50a0a' },
    { x: 0.58 + run * 0.3, y: 0.32, c: '#d50a0a' },
  ]
  for (const g of guys) {
    ctx.fillStyle = g.c
    ctx.beginPath()
    ctx.ellipse(g.x * w, g.y * h, w * 0.045, h * 0.07, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f4f1ff'
    ctx.beginPath()
    ctx.arc(g.x * w, g.y * h - h * 0.055, w * 0.022, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#c2410c'
  ctx.beginPath()
  ctx.ellipse((0.34 + run * 0.48) * w, 0.5 * h, w * 0.028, h * 0.018, -0.4, 0, Math.PI * 2)
  ctx.fill()
}

function makeAthlete(role: string, num: number, off: boolean, mine: boolean, x: number, y: number): Athlete {
  return { x, y, vx: 0, vy: 0, role, num, off, mine }
}

function place(m: Match) {
  const d = m.dir
  const los = m.los
  const offMine = m.offMine
  const yOff = [26.5, 26.5, 7, 46, 18, 22, 26.5, 31, 12]
  const yDef = [26.5, 22, 31, 16, 26.5, 38, 7, 46, 26.5]
  const squad: Athlete[] = []
  for (let i = 0; i < PLAYERS; i++) {
    const ol = i >= 5 && i <= 7
    const x = los - d * (i === 0 ? 4.5 : i === 1 ? 7 : ol ? 0.6 : i === 4 ? 1.2 : 1.8)
    squad.push(makeAthlete(offRoles[i], 10 + i * 2, true, offMine, x, yOff[i]))
  }
  for (let i = 0; i < PLAYERS; i++) {
    const x = los + d * (i < 3 ? 1.2 : i < 6 ? 4.5 : i === 8 ? 11 : 7)
    squad.push(makeAthlete(defRoles[i], 50 + i * 3, false, !offMine, x, yDef[i]))
  }
  m.squad = squad
  m.ctrl = offMine ? 0 : 13
  m.ctrl2 = offMine ? 13 : 0
  const qb = squad[0]
  m.ball = { x: qb.x, y: qb.y, vx: 0, vy: 0, hold: 0, air: false }
}

function holder(m: Match) {
  if (m.ball.air || m.ball.hold < 0) return null
  return m.squad[m.ball.hold] || null
}

function startMatch(save: Save, mode: FbMode, mine: Team): Match {
  const gameN = Math.min(STREAK_NEEDED, (save.streak[mode] || 0) + 1)
  const foe = pickFoe(mine, gameN)
  const m: Match = {
    mode,
    mine,
    foe,
    gameN,
    half: 1,
    clock: HALF_TIME,
    homeScore: 0,
    awayScore: 0,
    los: 25,
    down: 1,
    toGo: 10,
    dir: 1,
    state: 'presnap',
    deadT: 0,
    snapT: 0,
    t: 0,
    offMine: true,
    ball: { x: 25, y: 26.5, vx: 0, vy: 0, hold: 0, air: false },
    squad: [],
    ctrl: 0,
    ctrl2: 13,
    playClock: 18,
    msg: 'Hike!',
  }
  place(m)
  return m
}

function stats(save: Save, mine: boolean, mode: FbMode, gameN: number) {
  const boost = mine ? rosterBoost(save) : 0
  const shop = mine ? 1 : 0
  const diff = difficulty(mode, gameN)
  const ai = mine ? 0 : diff
  return {
    spd: 11.5 + save.speed * shop * 0.9 + boost * 0.7 + ai * 4.2,
    str: 0.42 + save.strength * shop * 0.06 + boost * 0.05 + ai * 0.22,
    arm: 22 + save.arm * shop * 2.4 + boost * 1.4,
    hands: 1.55 + save.hands * shop * 0.18 + boost * 0.12,
  }
}

export function mountFootballBros(host: HTMLElement): Unmount {
  let save = loadSave()
  persist(save)
  let view: 'hub' | 'teams' | 'shop' | 'play' = 'hub'
  let mode: FbMode = 'ais'
  let match: Match | null = null
  let raf = 0
  let canvas: HTMLCanvasElement | null = null
  const keys = new Set<string>()
  let aim = { x: 0, y: 0, on: false, p2: false }
  host.classList.add('fb-host')

  const paintMenu = () => {
    cancelAnimationFrame(raf)
    canvas = null
    match = null
    if (view === 'hub') {
      host.innerHTML = `
        <div class="fb-hub">
          <div class="waves-menu">
            <p class="waves-kicker">Football Bros</p>
            <h2>9-on-9. Super Bowl in ten.</h2>
            <p class="waves-sub">${save.coins} coins · ${save.trophies} trophies · ${rosterName(save)} · best streak ${save.bestStreak}</p>
            <div class="waves-modes">
              <button class="mode-sq" data-mode="competitive"><span>🏆</span>Play Competitive</button>
              <button class="mode-sq" data-mode="ais"><span>🤖</span>AIs</button>
              <button class="mode-sq" data-mode="people"><span>👥</span>Real People</button>
            </div>
            <div class="waves-modes" style="grid-template-columns:1fr 1fr;max-width:360px">
              <button class="mode-sq" data-go="shop"><span>⚡</span>Upgrades</button>
              <button class="mode-sq" data-go="hub"><span>🏆</span>${save.superBowls} Super Bowls</button>
            </div>
            <p class="waves-help">Win a game for 10 coins. Win 10 in a row to lift the Super Bowl and grab 2 trophies. Trophies unlock better players. Competitive AIs hit harder. Real People is two players on this screen.</p>
            <p class="waves-sub">Streaks — Competitive ${save.streak.competitive}/${STREAK_NEEDED} · AIs ${save.streak.ais}/${STREAK_NEEDED}</p>
          </div>
        </div>`
      return
    }
    if (view === 'shop') {
      host.innerHTML = `
        <div class="fb-hub">
          <div class="waves-menu">
            <button class="waves-back" data-go="hub">← Menu</button>
            <h2>Training room</h2>
            <p class="waves-sub">${save.coins} coins · roster ${rosterName(save)} (trophies ${save.trophies})</p>
            <div class="fb-shop">
              ${shopKeys
                .map((k) => {
                  const lvl = save[k]
                  const cost = shopCost(lvl)
                  const max = lvl >= 5
                  return `<button class="skin-card" data-buy="${k}" ${max || save.coins < cost ? 'disabled' : ''}>
                    <strong>${shopLabels[k]}</strong>
                    <em>${max ? 'MAX' : `Lv ${lvl} → ${lvl + 1} · ${cost} coins`}</em>
                  </button>`
                })
                .join('')}
            </div>
            <p class="waves-help">More trophies upgrade the whole 9-man roster. Shop coins boost speed, strength, arm, and hands.</p>
          </div>
        </div>`
      return
    }
    const groups = ['AFC', 'NFC'] as const
    host.innerHTML = `
      <div class="fb-hub">
        <div class="waves-menu">
          <button class="waves-back" data-go="hub">← Menu</button>
          <h2>Choose your team</h2>
          <p class="waves-sub">${mode === 'competitive' ? 'League AIs — tougher each week' : mode === 'people' ? 'Same-screen 2 player' : 'Arcade AIs'} · then you load into the game</p>
          ${groups
            .map((conf) => {
              const list = nfl.filter((t) => t.conf === conf)
              return `<p class="waves-kicker">${conf}</p>
                <div class="fb-teams">${list
                  .map(
                    (t) => `<button class="fb-team ${save.team === t.id ? 'on' : ''}" data-team="${t.id}" style="--c:${t.primary};--c2:${t.secondary}">
                      <b>${t.abbr}</b><span>${t.city} ${t.name}</span>
                    </button>`,
                  )
                  .join('')}</div>`
            })
            .join('')}
        </div>
      </div>`
  }

  const begin = (teamId: string) => {
    save.team = teamId
    persist(save)
    view = 'play'
    match = startMatch(save, mode, teamById(teamId))
    host.innerHTML = `
      <div class="fb-play">
        <div class="waves-hud">
          <button data-go="hub">Menu</button>
          <p data-hud></p>
          <button data-act="pass">Pass</button>
        </div>
        <canvas class="play-canvas"></canvas>
        <div class="waves-win" data-win hidden></div>
      </div>`
    canvas = host.querySelector('canvas')
    loop()
  }

  const snap = (m: Match) => {
    if (m.state !== 'presnap') return
    m.state = 'live'
    m.snapT = m.t
    m.msg = 'Ball is live'
    m.playClock = 18
  }

  const throwPass = (m: Match, fromP2: boolean) => {
    const h = holder(m)
    if (!h || m.state !== 'live' || m.ball.air) return
    const mineThrow = h.mine
    if (m.mode === 'people' && fromP2 === mineThrow) return
    if (m.mode !== 'people' && !mineThrow) return
    const st = stats(save, h.mine, m.mode, m.gameN)
    const recs = m.squad.filter((p) => p.off === h.off && p !== h && (p.role === 'WR' || p.role === 'TE' || p.role === 'RB' || p.role === 'SL'))
    let best = recs[0]
    let bestS = -1e9
    for (const r of recs) {
      const downfield = (r.x - h.x) * m.dir
      const sep = Math.min(...m.squad.filter((d) => d.off !== h.off).map((d) => dist(d, r)))
      const score = downfield * 1.2 + sep * 2 - dist(h, r) * 0.15
      if (score > bestS) {
        bestS = score
        best = r
      }
    }
    if (!best) return
    const d = dist(h, best) || 1
    const spd = st.arm
    m.ball.air = true
    m.ball.hold = -1
    m.ball.vx = ((best.x - h.x) / d) * spd
    m.ball.vy = ((best.y - h.y) / d) * spd
    m.msg = 'Ball in the air'
  }

  const whistle = (m: Match, kind: string) => {
    if (m.state !== 'live') return
    m.state = 'dead'
    m.deadT = m.t
    const ballX = clamp(m.ball.x, EZ, FIELD_L - EZ)
    if (kind === 'incomplete') {
      m.msg = 'Incomplete'
      m.down += 1
      if (m.down > 4) {
        m.offMine = !m.offMine
        m.dir *= -1
        m.down = 1
        m.toGo = 10
        m.msg = 'Turnover on downs'
      }
      return
    }
    if (kind === 'td') {
      if (m.offMine) m.homeScore += 7
      else m.awayScore += 7
      m.msg = 'Touchdown!'
      m.offMine = !m.offMine
      m.dir *= -1
      m.los = m.offMine ? (m.dir > 0 ? 25 : FIELD_L - 25) : m.dir > 0 ? 25 : FIELD_L - 25
      m.down = 1
      m.toGo = 10
      return
    }
    if (kind === 'int' || kind === 'fumble') {
      m.msg = kind === 'int' ? 'Picked off!' : 'Fumble!'
      m.offMine = !m.offMine
      m.dir *= -1
      m.los = clamp(ballX, EZ + 1, FIELD_L - EZ - 1)
      m.down = 1
      m.toGo = 10
      return
    }
    if (kind === 'safety') {
      if (m.offMine) m.awayScore += 2
      else m.homeScore += 2
      m.msg = 'Safety'
      m.offMine = !m.offMine
      m.dir *= -1
      m.los = m.dir > 0 ? 25 : FIELD_L - 25
      m.down = 1
      m.toGo = 10
      return
    }
    const gained = (ballX - m.los) * m.dir
    m.los = ballX
    if (gained + 0.4 >= m.toGo) {
      m.down = 1
      m.toGo = 10
      m.msg = 'First down'
    } else {
      m.down += 1
      m.toGo = Math.max(0.5, m.toGo - gained)
      m.msg = m.down > 4 ? 'Turnover on downs' : `Down ${m.down}`
      if (m.down > 4) {
        m.offMine = !m.offMine
        m.dir *= -1
        m.down = 1
        m.toGo = 10
      }
    }
  }

  const finish = (m: Match) => {
    if (m.state === 'over') return
    m.state = 'over'
    const win = m.homeScore > m.awayScore
    m.result = win ? 'win' : 'loss'
    if (win) {
      save.coins += COIN_WIN
      if (m.mode !== 'people') {
        save.streak[m.mode] += 1
        save.bestStreak = Math.max(save.bestStreak, save.streak[m.mode])
        if (save.streak[m.mode] >= STREAK_NEEDED) {
          save.streak[m.mode] = 0
          save.trophies += SB_TROPHIES
          save.superBowls += 1
        }
      }
    } else if (m.mode !== 'people') {
      save.streak[m.mode] = 0
    }
    persist(save)
    const panel = host.querySelector<HTMLElement>('[data-win]')
    if (!panel) return
    panel.hidden = false
    const sb = win && m.mode !== 'people' && save.superBowls > 0 && save.streak[m.mode] === 0 && save.trophies >= SB_TROPHIES
    const justSb = win && m.mode !== 'people' && m.gameN >= STREAK_NEEDED
    panel.innerHTML = `
      <p class="win-kicker">${m.mine.abbr} ${m.homeScore} – ${m.awayScore} ${m.foe.abbr}</p>
      <h3>${justSb ? 'Super Bowl champs!' : win ? 'You win!' : m.homeScore === m.awayScore ? 'Tie — counts as a loss' : 'Tough one'}</h3>
      <p class="win-coins">${win ? `+${COIN_WIN} coins` : 'No coins this game'}${justSb ? ` · +${SB_TROPHIES} trophies` : ''}</p>
      <p class="win-award">${justSb || sb ? 'Two trophies. Better players unlocked.' : `Streak ${save.streak[m.mode]}/${STREAK_NEEDED} · ${rosterName(save)}`}</p>
      <div class="win-actions">
        <button data-next>Next game</button>
        <button data-go="hub">Menu</button>
      </div>`
  }

  const steer = (p: Athlete, tx: number, ty: number, cap: number, dt: number) => {
    const dx = tx - p.x
    const dy = ty - p.y
    const mag = Math.hypot(dx, dy) || 1
    const want = Math.min(cap, mag * 8)
    p.vx += ((dx / mag) * want - p.vx) * Math.min(1, dt * 10)
    p.vy += ((dy / mag) * want - p.vy) * Math.min(1, dt * 10)
  }

  const moveBody = (p: Athlete, dt: number) => {
    p.x = clamp(p.x + p.vx * dt, 1, FIELD_L - 1)
    p.y = clamp(p.y + p.vy * dt, 1.2, FIELD_W - 1.2)
    p.vx *= 0.86
    p.vy *= 0.86
  }

  const controlVec = (p1: boolean) => {
    let x = 0
    let y = 0
    if (p1) {
      if (keys.has('KeyW')) y -= 1
      if (keys.has('KeyS')) y += 1
      if (keys.has('KeyA')) x -= 1
      if (keys.has('KeyD')) x += 1
      if (match?.mode !== 'people') {
        if (keys.has('ArrowUp')) y -= 1
        if (keys.has('ArrowDown')) y += 1
        if (keys.has('ArrowLeft')) x -= 1
        if (keys.has('ArrowRight')) x += 1
      }
    } else {
      if (keys.has('ArrowUp')) y -= 1
      if (keys.has('ArrowDown')) y += 1
      if (keys.has('ArrowLeft')) x -= 1
      if (keys.has('ArrowRight')) x += 1
    }
    if (aim.on && aim.p2 === !p1) {
      x += aim.x
      y += aim.y
    }
    const mag = Math.hypot(x, y)
    if (mag < 0.12) return { x: 0, y: 0 }
    return { x: x / mag, y: y / mag }
  }

  const loop = () => {
    raf = requestAnimationFrame(loop)
    const m = match
    if (!m || !canvas) return
    const dt = 1 / 60
    m.t += dt
    if (m.state === 'presnap' || m.state === 'live') {
      m.clock -= dt
      if (m.clock <= 0) {
        if (m.half === 1) {
          m.half = 2
          m.clock = HALF_TIME
          m.state = 'presnap'
          m.dir *= -1
          m.offMine = true
          m.los = m.dir > 0 ? 25 : FIELD_L - 25
          m.down = 1
          m.toGo = 10
          m.msg = 'Second half'
          place(m)
        } else {
          finish(m)
        }
      }
    }
    if (m.state === 'presnap') {
      m.playClock -= dt
      if (m.playClock <= 0) snap(m)
      if (m.mode !== 'people' && !m.offMine && m.t > 0.8) snap(m)
    }
    if (m.state === 'dead' && m.t - m.deadT > 1.15) {
      m.state = 'presnap'
      m.playClock = 16
      place(m)
    }

    const myst = stats(save, true, m.mode, m.gameN)
    const aist = stats(save, false, m.mode, m.gameN)

    if (m.state === 'live' || m.state === 'presnap') {
      const h = holder(m)
      for (let i = 0; i < m.squad.length; i++) {
        const p = m.squad[i]
        const st = p.mine ? myst : aist
        const isCtrl = i === m.ctrl
        const isCtrl2 = m.mode === 'people' && i === m.ctrl2
        if (m.state === 'presnap') {
          p.vx *= 0.7
          p.vy *= 0.7
          continue
        }
        if (isCtrl || isCtrl2) {
          const v = controlVec(isCtrl)
          p.vx += v.x * st.spd * dt * 14
          p.vy += v.y * st.spd * dt * 14
          const spd = Math.hypot(p.vx, p.vy)
          if (spd > st.spd) {
            p.vx = (p.vx / spd) * st.spd
            p.vy = (p.vy / spd) * st.spd
          }
        } else if (p.off) {
          const qb = m.squad[0]
          if (p.role === 'QB' && h === p) {
            const runTo = { x: p.x + m.dir * 8, y: p.y + Math.sin(m.t * 2) * 4 }
            if (m.t - m.snapT > 1.35 + (p.mine ? 9 : 0)) {
              const recs = m.squad.filter((r) => r.off && r !== p)
              const target = recs.sort((a, b) => (b.x - a.x) * m.dir)[0]
              if (target && !p.mine) {
                const d = dist(p, target) || 1
                m.ball.air = true
                m.ball.hold = -1
                m.ball.vx = ((target.x - p.x) / d) * aist.arm
                m.ball.vy = ((target.y - p.y) / d) * aist.arm
              } else steer(p, runTo.x, runTo.y, st.spd * 0.85, dt)
            } else steer(p, p.x - m.dir * 1.2, p.y, st.spd * 0.4, dt)
          } else if (p.role === 'LT' || p.role === 'C' || p.role === 'RT') {
            const threat = m.squad.filter((d) => !d.off).sort((a, b) => dist(a, qb) - dist(b, qb))[0]
            if (threat) steer(p, threat.x - m.dir * 0.8, threat.y, st.spd * 0.7, dt)
          } else {
            const routeX = p.x + m.dir * (p.role === 'RB' ? 3 : 14)
            const routeY = p.role === 'WR' && p.y < 20 ? 4 : p.role === 'WR' ? 49 : p.y + Math.sin(m.t * 3 + i) * 2
            steer(p, routeX, routeY, st.spd * 0.92, dt)
          }
        } else {
          const target = h || m.ball
          const contain = p.y + (p.role.includes('CB') ? 0 : (26.5 - p.y) * 0.02)
          steer(p, target.x + m.dir * 0.4, contain * 0.15 + target.y * 0.85, st.spd * 0.95, dt)
        }
        moveBody(p, dt)
      }

      if (h && !m.ball.air) {
        m.ball.x = h.x + m.dir * 0.6
        m.ball.y = h.y
      } else if (m.ball.air) {
        m.ball.x += m.ball.vx * dt
        m.ball.y += m.ball.vy * dt
        m.ball.vx *= 0.995
        m.ball.vy *= 0.995
        for (const p of m.squad) {
          const reach = (p.mine ? myst : aist).hands
          if (dist(p, m.ball) < reach) {
            const offenseCatch = p.off
            if (offenseCatch || Math.random() < 0.55 + (p.mine ? 0.1 : 0)) {
              m.ball.air = false
              m.ball.hold = m.squad.indexOf(p)
              m.ball.vx = 0
              m.ball.vy = 0
              if (!p.off) whistle(m, 'int')
              else m.msg = 'Caught!'
              break
            }
          }
        }
        if (m.ball.x < 0.5 || m.ball.x > FIELD_L - 0.5 || m.ball.y < 0.4 || m.ball.y > FIELD_W - 0.4) {
          m.ball.air = false
          m.ball.x = m.los
          m.ball.y = 26.5
          whistle(m, 'incomplete')
        }
      }

      const carry = holder(m)
      if (carry && !m.ball.air) {
        const idx = m.squad.indexOf(carry)
        if (carry.mine) m.ctrl = idx
        else if (m.mode === 'people') m.ctrl2 = idx
        else m.ctrl = m.squad.findIndex((p) => p.mine && !p.off)
        if (m.ctrl < 0) m.ctrl = 9
      }
      if (carry && m.state === 'live') {
        if ((m.dir > 0 && carry.x >= FIELD_L - EZ) || (m.dir < 0 && carry.x <= EZ)) whistle(m, 'td')
        else if ((m.dir > 0 && carry.x <= EZ) || (m.dir < 0 && carry.x >= FIELD_L - EZ)) whistle(m, 'safety')
        else {
          for (const d of m.squad) {
            if (d.off === carry.off) continue
            if (dist(d, carry) < 1.55) {
              const hit = (d.mine ? myst : aist).str
              const brk = (carry.mine ? myst : aist).str
              if (Math.random() < hit * dt * 7.5 && Math.random() > brk * 0.55) {
                if (Math.random() < 0.08) whistle(m, 'fumble')
                else whistle(m, 'tackle')
                m.msg = 'Tackled'
                break
              }
            }
          }
        }
      }

      if (!m.offMine && m.mode !== 'people' && holder(m)?.role === 'QB' && m.t - m.snapT > 2.1 && Math.random() < dt * 0.8) {
        const qb = m.squad[0]
        if (holder(m) === qb) {
          const recs = m.squad.filter((r) => r.off && r !== qb)
          const target = recs[Math.floor(Math.random() * recs.length)]
          const d = dist(qb, target) || 1
          m.ball.air = true
          m.ball.hold = -1
          m.ball.vx = ((target.x - qb.x) / d) * aist.arm
          m.ball.vy = ((target.y - qb.y) / d) * aist.arm
        }
      }
    }

    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(280, Math.floor(rect.width * dpr))
    canvas.height = Math.max(180, Math.floor((rect.height - 48) * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const camX = m.ball.x
    const scale = Math.min(w / 38, h / 22)
    const sx = (x: number) => (x - camX) * scale + w * 0.42
    const sy = (y: number) => (y / FIELD_W) * (h * 0.86) + h * 0.08

    ctx.fillStyle = '#166534'
    ctx.fillRect(0, 0, w, h)
    for (let yds = 0; yds <= FIELD_L; yds += 5) {
      const x = sx(yds)
      ctx.fillStyle = yds < EZ || yds > FIELD_L - EZ ? (yds < EZ ? m.mine.primary : m.foe.primary) : yds % 10 === 0 ? '#15803d' : '#16a34a'
      if (yds < EZ) ctx.fillRect(sx(0), 0, sx(EZ) - sx(0), h)
      if (yds === FIELD_L - EZ) ctx.fillRect(sx(FIELD_L - EZ), 0, sx(FIELD_L) - sx(FIELD_L - EZ), h)
      ctx.strokeStyle = '#f8fafc88'
      ctx.lineWidth = yds % 10 === 0 ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(x, sy(0))
      ctx.lineTo(x, sy(FIELD_W))
      ctx.stroke()
      if (yds > EZ && yds < FIELD_L - EZ && yds % 10 === 0) {
        ctx.fillStyle = '#f8fafccc'
        ctx.font = `${Math.floor(h * 0.045)}px IBM Plex Sans, sans-serif`
        ctx.fillText(String(Math.min(yds - EZ, FIELD_L - EZ - yds)), x + 6, sy(8))
      }
    }
    ctx.strokeStyle = '#fbbf24'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(sx(m.los), sy(0))
    ctx.lineTo(sx(m.los), sy(FIELD_W))
    ctx.stroke()
    ctx.strokeStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(sx(m.los + m.dir * m.toGo), sy(0))
    ctx.lineTo(sx(m.los + m.dir * m.toGo), sy(FIELD_W))
    ctx.stroke()
    ctx.setLineDash([])

    for (const p of m.squad) {
      const team = p.mine ? m.mine : m.foe
      ctx.fillStyle = team.primary
      ctx.beginPath()
      ctx.ellipse(sx(p.x), sy(p.y), 0.85 * scale, 1.05 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = team.secondary
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#f8fafc'
      ctx.font = `${Math.floor(0.7 * scale)}px IBM Plex Sans, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(String(p.num), sx(p.x), sy(p.y) + scale * 0.25)
      ctx.font = `${Math.floor(0.42 * scale)}px IBM Plex Sans, sans-serif`
      ctx.fillText(p.role, sx(p.x), sy(p.y) + scale * 1.45)
    }
    ctx.fillStyle = '#c2410c'
    ctx.beginPath()
    ctx.ellipse(sx(m.ball.x), sy(m.ball.y), 0.45 * scale, 0.28 * scale, -0.5, 0, Math.PI * 2)
    ctx.fill()

    const ci = m.ctrl
    const c = m.squad[ci]
    if (c) {
      ctx.strokeStyle = '#f4f1ff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(sx(c.x), sy(c.y), 1.25 * scale, 1.45 * scale, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (m.mode === 'people') {
      const c2 = m.squad[m.ctrl2]
      if (c2) {
        ctx.strokeStyle = '#fbbf24'
        ctx.beginPath()
        ctx.ellipse(sx(c2.x), sy(c2.y), 1.25 * scale, 1.45 * scale, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = '#f8fafc'
    ctx.font = `${Math.floor(h * 0.04)}px IBM Plex Sans, sans-serif`
    const hud = host.querySelector('[data-hud]')
    if (hud) {
      const clock = `${Math.max(0, Math.ceil(m.clock))}s H${m.half}`
      hud.textContent = `${m.mine.abbr} ${m.homeScore}  ${m.foe.abbr} ${m.awayScore}  ·  ${m.down} & ${m.toGo.toFixed(0)}  ·  ${clock}  ·  ${m.msg}`
    }
  }

  const onClick = (e: Event) => {
    const t = e.target as HTMLElement
    const pickedMode = t.closest<HTMLElement>('[data-mode]')?.dataset.mode as FbMode | undefined
    if (pickedMode) {
      mode = pickedMode
      view = 'teams'
      paintMenu()
      return
    }
    if (t.closest('[data-go="hub"]')) {
      view = 'hub'
      paintMenu()
      return
    }
    if (t.closest('[data-go="shop"]')) {
      view = 'shop'
      paintMenu()
      return
    }
    const buy = t.closest<HTMLElement>('[data-buy]')?.dataset.buy as (typeof shopKeys)[number] | undefined
    if (buy) {
      const cost = shopCost(save[buy])
      if (save[buy] >= 5 || save.coins < cost) return
      save.coins -= cost
      save[buy] += 1
      persist(save)
      paintMenu()
      return
    }
    const team = t.closest<HTMLElement>('[data-team]')?.dataset.team
    if (team) begin(team)
    if (t.closest('[data-act="pass"]') && match) {
      if (match.state === 'presnap') snap(match)
      else throwPass(match, false)
    }
    if (t.closest('[data-next]') && match) begin(save.team)
  }

  const pointerAim = (e: PointerEvent, down: boolean) => {
    if (!match || view !== 'play' || !canvas) return
    if ((e.target as HTMLElement).closest('button')) return
    const r = canvas.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    const p2 = match.mode === 'people' && e.clientX > r.left + r.width * 0.5
    if (down) {
      aim = { x: nx, y: ny, on: true, p2 }
      if (match.state === 'presnap' && !p2) snap(match)
    } else if (aim.on) {
      aim.x = nx * 2
      aim.y = ny * 2
    }
  }

  const onPtrDown = (e: PointerEvent) => {
    pointerAim(e, true)
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
  }
  const onPtrMove = (e: PointerEvent) => pointerAim(e, false)
  const onPtrUp = () => {
    aim.on = false
  }
  const onKey = (e: KeyboardEvent) => {
    keys.add(e.code)
    if (!match) return
    if (e.code === 'Space') {
      e.preventDefault()
      if (match.state === 'presnap') snap(match)
      else throwPass(match, false)
    }
    if (e.code === 'Enter' && match.mode === 'people') {
      e.preventDefault()
      if (match.state === 'presnap') snap(match)
      else throwPass(match, true)
    }
    if (e.code === 'KeyQ' && match.state === 'live') {
      const defs = match.squad.map((p, i) => ({ p, i })).filter((x) => x.p.mine === (holder(match!)?.mine === false))
      if (defs.length) match.ctrl = defs[(defs.findIndex((d) => d.i === match!.ctrl) + 1 + defs.length) % defs.length].i
    }
  }
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code)

  host.addEventListener('click', onClick)
  host.addEventListener('pointerdown', onPtrDown)
  host.addEventListener('pointermove', onPtrMove)
  host.addEventListener('pointerup', onPtrUp)
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKeyUp)
  paintMenu()

  return () => {
    cancelAnimationFrame(raf)
    host.removeEventListener('click', onClick)
    host.removeEventListener('pointerdown', onPtrDown)
    host.removeEventListener('pointermove', onPtrMove)
    host.removeEventListener('pointerup', onPtrUp)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keyup', onKeyUp)
    host.classList.remove('fb-host')
    host.innerHTML = ''
  }
}
