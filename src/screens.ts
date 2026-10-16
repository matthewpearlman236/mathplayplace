import { drawFlipBottle, springBottleSkin } from './bottleFlip.ts'
import { drawFootballCover } from './footballBros.ts'
import { catalog, getGame, playableGames, searchCatalog, webShortcuts } from './catalog.ts'
import { generateGame, loadGenerated, saveGenerated } from './generator.ts'
import { mountGame, type Unmount } from './games.ts'
import {
  bindCalc,
  bindClips,
  bindMessages,
  bindMusic,
  bindNotes,
  bindPhone,
  calculatorView,
  clipsView,
  messagesView,
  musicView,
  notesView,
  phoneView,
  youtubeView,
} from './phoneApps.ts'

export type ScreenHandle = { html: string; after?: (root: HTMLElement) => Unmount | void }

function linkAttrs(href: string): string {
  const extra = /^https?:/i.test(href) ? ' target="_blank" rel="noreferrer"' : ''
  return `href="${escapeAttr(href)}"${extra}`
}

function card(item: (typeof catalog)[number]): string {
  const thumb =
    item.id === 'space-waves'
      ? `<div class="thumb thumb-ship">${spaceShipMark()}</div>`
      : item.id === 'bottle-flip'
        ? `<div class="thumb thumb-flip"><canvas data-bottle-cover></canvas></div>`
        : item.id === 'football-bros'
          ? `<div class="thumb thumb-fb"><canvas data-fb-cover></canvas></div>`
          : `<div class="thumb" style="background:${item.tint}">${item.emoji}</div>`
  return `
    <a class="card" ${linkAttrs(item.route)}>
      ${thumb}
      <div class="card-body">
        <h3>${item.title}</h3>
        <p>${item.blurb}</p>
        <span class="tag">${item.kind} · ${item.players}</span>
      </div>
    </a>`
}

function spaceShipMark(): string {
  return `
    <svg class="ship-logo" viewBox="0 0 160 90" aria-hidden="true">
      <defs>
        <linearGradient id="ship-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f4f1ff"/>
          <stop offset="1" stop-color="#c4d4ff"/>
        </linearGradient>
      </defs>
      <circle cx="24" cy="18" r="1.4" fill="#fff"/>
      <circle cx="48" cy="12" r="1" fill="#6ef7ff"/>
      <circle cx="132" cy="22" r="1.2" fill="#fff"/>
      <circle cx="118" cy="70" r="1" fill="#ff2f92"/>
      <path d="M18 46h28" stroke="#ff2f92" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <path d="M8 46h16" stroke="#6ef7ff" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      <path d="M142 46 L58 22 L70 46 L58 70 Z" fill="url(#ship-body)"/>
      <path d="M70 46 L58 28 L48 46 L58 64 Z" fill="#7aa2ff"/>
      <circle cx="108" cy="46" r="7" fill="#6ef7ff"/>
      <circle cx="108" cy="46" r="3.5" fill="#071428"/>
      <path d="M64 24 L48 10 L62 32 Z" fill="#ff2f92"/>
      <path d="M64 68 L48 82 L62 60 Z" fill="#ff2f92"/>
    </svg>`
}

export function homeScreen(): ScreenHandle {
  const featured = playableGames
  const web = catalog.filter((i) => i.kind === 'web')
  return {
    html: `
      <section class="hero">
        <div>
          <p class="kicker">Mathplayplace</p>
          <h1>A whole phone full of games.</h1>
          <p class="lede">Play built-in arcade titles, generate a new one with AI Lab, or search the web like Google — without leaving the app.</p>
          <div class="hero-actions">
            <a class="btn" href="#/play/space-waves">Play Space Waves</a>
            <a class="btn ghost" href="#/lab">Open AI Lab</a>
          </div>
        </div>
        <a class="hero-art" href="#/play/space-waves" aria-label="Play Space Waves">
          <canvas class="hero-logo" data-hero-logo></canvas>
        </a>
      </section>
      <section>
        <div class="row-head"><h2>Play now</h2><a href="#/search?q=game">See all</a></div>
        <div class="grid">${featured.map(card).join('')}</div>
      </section>
      <section>
        <div class="row-head"><h2>Game websites</h2><a href="#/web">Arcade Browser</a></div>
        <div class="grid slim">${web.map(card).join('')}</div>
      </section>
    `,
    after: (root) => {
      const stopHero = startHeroLogo(root)
      const stopFlip = startBottleCovers(root)
      const stopFb = startFbCovers(root)
      return () => {
        stopHero()
        stopFlip()
        stopFb()
      }
    },
  }
}

function startHeroLogo(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-logo]')
  if (!canvas) return () => {}
  let raf = 0
  let t = 0
  const spikes = Array.from({ length: 8 }, (_, i) => ({
    x: 0.2 + i * 0.38,
    fromTop: i % 2 === 0,
  }))

  const draw = () => {
    raf = requestAnimationFrame(draw)
    t += 1
    const box = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(160, Math.floor(box.width * dpr))
    canvas.height = Math.max(160, Math.floor(box.height * dpr))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#070814')
    sky.addColorStop(0.55, '#101838')
    sky.addColorStop(1, '#1a0830')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 36; i++) {
      const sx = ((i * 73 + t * 0.6) % (w + 8)) - 4
      ctx.fillStyle = i % 5 === 0 ? '#6ef7ff' : '#ffffff44'
      ctx.fillRect(sx, (i * 47) % h, 2, 2)
    }

    const top = h * 0.18
    const bot = h * 0.82
    ctx.fillStyle = '#12182c'
    ctx.fillRect(0, 0, w, top)
    ctx.fillRect(0, bot, w, h - bot)
    ctx.strokeStyle = '#6ef7ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, top)
    ctx.lineTo(w, top)
    ctx.moveTo(0, bot)
    ctx.lineTo(w, bot)
    ctx.stroke()

    ctx.fillStyle = '#ff2f92'
    for (const spike of spikes) {
      spike.x -= 0.0045
      if (spike.x < -0.12) {
        spike.x += 8 * 0.38
        spike.fromTop = !spike.fromTop
      }
      const px = spike.x * w
      ctx.beginPath()
      if (spike.fromTop) {
        ctx.moveTo(px - 14, top)
        ctx.lineTo(px + 14, top)
        ctx.lineTo(px, top + h * 0.16)
      } else {
        ctx.moveTo(px - 14, bot)
        ctx.lineTo(px + 14, bot)
        ctx.lineTo(px, bot - h * 0.16)
      }
      ctx.fill()
    }

    const shipX = w * 0.32
    const weave = Math.sin(t * 0.045) * h * 0.16
    const shipY = h * 0.5 + weave
    const up = Math.cos(t * 0.045) < 0
    ctx.strokeStyle = '#ff2f9288'
    ctx.lineWidth = 4
    ctx.beginPath()
    for (let i = 0; i < 16; i++) {
      const px = shipX - i * 10
      const py = h * 0.5 + Math.sin(t * 0.045 - i * 0.18) * h * 0.16
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.save()
    ctx.translate(shipX, shipY)
    ctx.rotate(up ? -0.65 : 0.65)
    ctx.fillStyle = '#f4f1ff'
    ctx.beginPath()
    ctx.moveTo(18, 0)
    ctx.lineTo(-14, -11)
    ctx.lineTo(-7, 0)
    ctx.lineTo(-14, 11)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  draw()
  return () => cancelAnimationFrame(raf)
}

function startBottleCovers(root: HTMLElement): Unmount {
  const skin = springBottleSkin()
  const stops = [...root.querySelectorAll<HTMLCanvasElement>('[data-bottle-cover]')].map((canvas) => {
    let raf = 0
    let t = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      t += 1
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(2, Math.floor(rect.width * dpr))
      const h = Math.max(2, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#24140e'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#3a2218'
      ctx.fillRect(0, h * 0.78, w, h)
      ctx.fillStyle = '#8b5a2b'
      ctx.fillRect(w * 0.18, h * 0.72, w * 0.64, h * 0.045)
      ctx.fillStyle = '#d6b48a'
      ctx.fillRect(w * 0.18, h * 0.72, w * 0.64, h * 0.012)
      const bounce = Math.sin(t * 0.07)
      const y = h * 0.42 + bounce * h * 0.08
      const spin = t * 0.085
      ctx.save()
      ctx.translate(w * 0.5, y)
      ctx.rotate(spin)
      drawFlipBottle(ctx, Math.min(w, h) * 0.22, Math.min(w, h) * 0.52, skin, false)
      ctx.restore()
    }
    tick()
    return () => cancelAnimationFrame(raf)
  })
  return () => {
    stops.forEach((stop) => stop())
  }
}

function startFbCovers(root: HTMLElement): Unmount {
  const stops = [...root.querySelectorAll<HTMLCanvasElement>('[data-fb-cover]')].map((canvas) => {
    let raf = 0
    let t = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      t += 1
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(2, Math.floor(rect.width * dpr))
      const h = Math.max(2, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawFootballCover(ctx, w, h, t)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  })
  return () => {
    stops.forEach((stop) => stop())
  }
}

export function searchScreen(query: string): ScreenHandle {
  const results = searchCatalog(query)
  const q = query.trim()
  const webUrl = q
    ? `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q + ' free online game')}`
    : ''
  return {
    html: `
      <section class="search-hero">
        <p class="kicker">PlaySearch</p>
        <h1>Find a game. Open it here.</h1>
        <form class="omnibox" data-search>
          <input name="q" value="${escapeAttr(q)}" placeholder="snake, poki, minecraft, youtube…" autofocus />
          <button type="submit">Search</button>
        </form>
        <div class="chips">
          ${['snake', 'puzzle', 'crazy games', 'youtube', 'ai'].map((c) => `<a href="#/search?q=${c}">${c}</a>`).join('')}
        </div>
      </section>
      ${
        q
          ? `<section>
              <div class="row-head"><h2>Mathplayplace results</h2><span>${results.length}</span></div>
              <div class="results">
                ${
                  results.length
                    ? results
                        .map(
                          (item) => `
                  <a class="result" ${linkAttrs(item.route)}>
                    <span class="emoji">${item.emoji}</span>
                    <span>
                      <strong>${item.title}</strong>
                      <em>${item.kind} · mathplayplace://${item.id}</em>
                      <span>${item.blurb}</span>
                    </span>
                  </a>`,
                        )
                        .join('')
                    : '<p class="empty">Nothing local matched. Use the web result below.</p>'
                }
              </div>
              <a class="btn" href="#/web?url=${encodeURIComponent(webUrl)}">Search the live web for “${escapeAttr(q)}”</a>
            </section>`
          : `<section><div class="grid">${catalog.slice(0, 12).map(card).join('')}</div></section>`
      }
    `,
    after: (root) => {
      const stopFlip = startBottleCovers(root)
      const stopFb = startFbCovers(root)
      root.querySelector<HTMLFormElement>('[data-search]')?.addEventListener('submit', (e) => {
        e.preventDefault()
        const value = new FormData(e.currentTarget as HTMLFormElement).get('q')
        location.hash = `#/search?q=${encodeURIComponent(String(value || ''))}`
      })
      return () => {
        stopFlip()
        stopFb()
      }
    },
  }
}

export function labScreen(): ScreenHandle {
  const last = loadGenerated()
  return {
    html: `
      <section class="lab">
        <p class="kicker">AI Lab</p>
        <h1>Type a vibe. Get a game.</h1>
        <p class="lede">No account. The generator reads your prompt, picks a genre, paints a palette, and builds a playable collect-and-dodge run.</p>
        <form data-lab>
          <textarea name="prompt" rows="4" placeholder="space cats collecting stars, ocean frogs, horror castle jump…">${
            last ? escapeAttr(last.title) : ''
          }</textarea>
          <button class="btn" type="submit">Generate & play</button>
        </form>
        ${
          last
            ? `<article class="gen-card">
                <h3>Last build: ${last.title}</h3>
                <p>${last.blurb}</p>
                <p class="tag">${last.genre}</p>
                <a class="btn ghost" href="#/play/generated">Replay it</a>
              </article>`
            : ''
        }
      </section>
    `,
    after: (root) => {
      root.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault()
        const prompt = String(new FormData(e.currentTarget as HTMLFormElement).get('prompt') || '')
        const config = generateGame(prompt)
        saveGenerated(config)
        location.hash = '#/play/generated'
      })
    },
  }
}

export function playScreen(id: string): ScreenHandle {
  if (id === 'spark-run') id = 'space-waves'
  if (id === 'neon-snake') id = 'football-bros'
  const game = id === 'generated' ? undefined : getGame(id)
  const gen = id === 'generated' ? loadGenerated() : undefined
  const title = gen?.title || game?.title || 'Unknown'
  const blurb = gen?.blurb || game?.blurb || 'This title is not in the library.'
  return {
    html: `
      <section class="play-head">
        <a href="#/">← Library</a>
        <div>
          <h1>${title}</h1>
          <p>${blurb}</p>
        </div>
      </section>
      <div class="play-stage ${
        id === 'space-waves' || id === 'bottle-flip' || id === 'football-bros' ? 'waves-stage' : ''
      }" data-stage></div>
      <p class="play-hint">${
        id === 'memory-grid'
          ? 'Tap tiles to flip them.'
          : id === 'tile-merge'
            ? 'Swipe the board or use arrow keys.'
            : id === 'space-waves'
              ? 'Hold to climb, release to dive. Hold the right side (or arrows) to boost.'
              : id === 'bottle-flip'
                ? 'Tap to flip. Keep tapping in the air. Land upright on the platforms.'
              : id === 'football-bros'
                ? 'Drag to run. Tap the field or Pass to throw. WASD (P1) and arrows (P2).'
                : 'Tap, drag, or use the keyboard inside the stage.'
      }</p>
    `,
    after: (root) => {
      const stage = root.querySelector<HTMLElement>('[data-stage]')
      if (!stage) return
      if (id === 'generated' && !gen) {
        stage.innerHTML = `<p class="empty">Generate something in <a href="#/lab">AI Lab</a> first.</p>`
        return
      }
      return mountGame(id, stage, gen || undefined)
    },
  }
}

export function appsScreen(): ScreenHandle {
  const apps = catalog.filter((i) => i.kind === 'app')
  return {
    html: `
      <section class="phone-home">
        <p class="kicker">Spark Phone</p>
        <h1>Apps</h1>
        <div class="app-grid">
          ${apps
            .map(
              (app) => `
            <a class="app-icon" href="${app.route}">
              <span class="app-bubble" style="background:${app.tint}">${app.emoji}</span>
              <span>${app.title}</span>
            </a>`,
            )
            .join('')}
        </div>
      </section>
    `,
  }
}

export function appScreen(id: string, params: URLSearchParams): ScreenHandle {
  if (id === 'youtube') {
    return {
      html: youtubeView(params.get('v')),
      after: (root) => {
        root.querySelector('[data-youtube-search]')?.addEventListener('submit', (e) => {
          e.preventDefault()
          const q = String(new FormData(e.currentTarget as HTMLFormElement).get('q') || '')
          location.hash = `#/web?url=${encodeURIComponent(`https://www.youtube.com/results?search_query=${q}`)}`
        })
      },
    }
  }
  if (id === 'clips') return { html: clipsView(), after: bindClips }
  if (id === 'phone') return { html: phoneView(), after: bindPhone }
  if (id === 'messages') return { html: messagesView(), after: bindMessages }
  if (id === 'notes') return { html: notesView(), after: bindNotes }
  if (id === 'calculator') return { html: calculatorView(), after: bindCalc }
  if (id === 'music') return { html: musicView(), after: bindMusic }
  return { html: `<p class="empty">Unknown app.</p>` }
}

const crazyGames = [
  { slug: 'ovo', title: 'OvO', blurb: 'Parkour stickman' },
  { slug: 'tunnel-rush', title: 'Tunnel Rush', blurb: 'Fly the neon tunnel' },
  { slug: 'stickman-hook', title: 'Stickman Hook', blurb: 'Swing and fling' },
  { slug: 'smash-karts', title: 'Smash Karts', blurb: 'Kart combat' },
  { slug: 'drift-hunters', title: 'Drift Hunters', blurb: 'Slide the streets' },
  { slug: 'spiral-roll', title: 'Spiral Roll', blurb: 'Grow the spiral' },
  { slug: 'stack-ball', title: 'Stack Ball', blurb: 'Smash the platforms' },
  { slug: 'helix-jump', title: 'Helix Jump', blurb: 'Drop the tower' },
  { slug: 'soccer-random', title: 'Soccer Random', blurb: 'Chaotic kicks' },
  { slug: 'getaway-shootout', title: 'Getaway Shootout', blurb: 'Grab the loot' },
]

export function crazyScreen(slug: string): ScreenHandle {
  const pick = crazyGames.find((g) => g.slug === slug) || crazyGames[0]
  const embed = `https://www.crazygames.com/embed/${pick.slug}`
  const site = `https://www.crazygames.com/game/${pick.slug}`
  return {
    html: `
      <section class="crazy-arcade">
        <p class="kicker">CrazyGames</p>
        <h1>${pick.title}</h1>
        <p class="lede">${pick.blurb}. If the player is blank, hit Start game — some browsers block the embed.</p>
        <div class="crazy-actions">
          <a class="btn" href="${escapeAttr(site)}" target="_blank" rel="noreferrer">Start game</a>
          <a class="btn ghost" href="https://www.crazygames.com" target="_blank" rel="noreferrer">Open CrazyGames.com</a>
        </div>
        <div class="crazy-player">
          <iframe
            src="${escapeAttr(embed)}"
            title="${escapeAttr(pick.title)}"
            allow="autoplay; fullscreen; gamepad; keyboard-map"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div class="row-head"><h2>More CrazyGames</h2></div>
        <div class="crazy-picks">
          ${crazyGames
            .map(
              (g) => `
            <a class="crazy-pick ${g.slug === pick.slug ? 'on' : ''}" href="#/crazy?g=${g.slug}">
              <strong>${g.title}</strong>
              <span>${g.blurb}</span>
            </a>`,
            )
            .join('')}
        </div>
      </section>
    `,
  }
}

const pokiGames = [
  { slug: 'moto-x3m', title: 'Moto X3M', blurb: 'Stunt the dirt track', tags: 'moto race bike stunt' },
  { slug: 'slope', title: 'Slope', blurb: 'Ride the neon ramp', tags: 'endless slope run' },
  { slug: 'drive-mad', title: 'Drive Mad', blurb: 'Flip the little car', tags: 'car drive stunt' },
  { slug: 'stickman-hook', title: 'Stickman Hook', blurb: 'Swing and fling', tags: 'stickman hook swing' },
  { slug: 'tunnel-rush', title: 'Tunnel Rush', blurb: 'Fly the neon tunnel', tags: 'runner tunnel' },
  { slug: 'smash-karts', title: 'Smash Karts', blurb: 'Kart combat', tags: 'kart race smash' },
  { slug: 'stack-ball', title: 'Stack Ball', blurb: 'Smash the platforms', tags: 'stack ball smash' },
  { slug: 'helix-jump', title: 'Helix Jump', blurb: 'Drop the tower', tags: 'helix jump tower' },
  { slug: 'spiral-roll', title: 'Spiral Roll', blurb: 'Grow the spiral', tags: 'spiral roll' },
  { slug: 'dunk-shot', title: 'Dunk Shot', blurb: 'Bank the basketball', tags: 'basketball sports dunk' },
  { slug: 'basket-random', title: 'Basket Random', blurb: 'Chaotic hoops', tags: 'basketball sports random' },
  { slug: 'soccer-random', title: 'Soccer Random', blurb: 'Chaotic kicks', tags: 'soccer football sports' },
  { slug: 'paper-io-2', title: 'Paper.io 2', blurb: 'Claim the map', tags: 'io paper capture' },
  { slug: 'run-3', title: 'Run 3', blurb: 'Tunnel parkour', tags: 'run tunnel endless' },
  { slug: 'getaway-shootout', title: 'Getaway Shootout', blurb: 'Grab the loot', tags: 'shootout versus' },
]

function pokiMatch(q: string) {
  const n = q.trim().toLowerCase()
  if (!n) return pokiGames
  return pokiGames.filter((g) => `${g.title} ${g.blurb} ${g.slug} ${g.tags}`.toLowerCase().includes(n))
}

export function pokiScreen(slug: string, query: string, make: string): ScreenHandle {
  const q = query.trim()
  const makePrompt = make.trim()
  const hits = pokiMatch(q)
  const pick = pokiGames.find((g) => g.slug === slug) || hits[0] || pokiGames[0]
  const generated = Boolean(makePrompt)
  const gen = generated ? generateGame(makePrompt) : undefined
  if (gen) saveGenerated(gen)
  const embed = `https://www.crazygames.com/embed/${pick.slug}`
  return {
    html: `
      <section class="crazy-arcade poki-arcade">
        <p class="kicker">Poki</p>
        <h1>${generated && gen ? gen.title : pick.title}</h1>
        <p class="lede">${
          generated && gen
            ? `Mathplayplace built this from your search “${escapeAttr(makePrompt)}”. Stay here and play.`
            : 'Search a game. Stay in Mathplayplace. No match? Type anything and we generate one.'
        }</p>
        <form class="omnibox" data-poki-search>
          <input name="q" value="${escapeAttr(q || makePrompt)}" placeholder="slope, soccer, space cats…" />
          <button type="submit">Search</button>
        </form>
        <div class="crazy-player ${generated ? 'poki-gen' : ''}" data-poki-stage>
          ${
            generated
              ? ''
              : `<iframe
            src="${escapeAttr(embed)}"
            title="${escapeAttr(pick.title)}"
            allow="autoplay; fullscreen; gamepad; keyboard-map"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>`
          }
        </div>
        <div class="row-head"><h2>${q && !generated ? `Results for “${escapeAttr(q)}”` : 'Instant games'}</h2></div>
        <div class="crazy-picks">
          ${(generated ? pokiGames : hits.length ? hits : pokiGames)
            .map(
              (g) => `
            <a class="crazy-pick ${!generated && g.slug === pick.slug ? 'on' : ''}" href="#/poki?g=${g.slug}">
              <strong>${g.title}</strong>
              <span>${g.blurb}</span>
            </a>`,
            )
            .join('')}
        </div>
      </section>
    `,
    after: (root) => {
      root.querySelector('[data-poki-search]')?.addEventListener('submit', (e) => {
        e.preventDefault()
        const value = String(new FormData(e.currentTarget as HTMLFormElement).get('q') || '').trim()
        if (!value) {
          location.hash = '#/poki'
          return
        }
        const found = pokiMatch(value)
        location.hash = found.length
          ? `#/poki?g=${found[0].slug}&q=${encodeURIComponent(value)}`
          : `#/poki?make=${encodeURIComponent(value)}`
      })
      if (!generated || !gen) return
      const stage = root.querySelector<HTMLElement>('[data-poki-stage]')
      if (!stage) return
      return mountGame('generated', stage, gen)
    },
  }
}

export function webScreen(url: string): ScreenHandle {
  if (/crazygames\.com/i.test(url) || url === 'arcadeos:crazy') {
    const m = url.match(/crazygames\.com\/(?:embed|game)\/([^/?#]+)/i)
    return crazyScreen(m?.[1] || 'ovo')
  }
  if (/poki\.com/i.test(url) || url === 'arcadeos:poki') {
    return pokiScreen('', '', '')
  }
  const target = url || 'https://html.duckduckgo.com/html/?q=free+online+games'
  return {
    html: `
      <section class="browser">
        <form class="omnibox" data-web>
          <input name="url" value="${escapeAttr(target)}" />
          <button type="submit">Go</button>
        </form>
        <div class="chips">
          ${webShortcuts
            .map((s) => {
              if (s.url === 'arcadeos:crazy' || /crazygames/i.test(s.url)) {
                return `<a href="#/crazy">${s.label}</a>`
              }
              if (s.url === 'arcadeos:poki' || /poki/i.test(s.url)) {
                return `<a href="#/poki">${s.label}</a>`
              }
              return `<a href="#/web?url=${encodeURIComponent(s.url)}">${s.label}</a>`
            })
            .join('')}
        </div>
        <p class="hint">Some sites block embedding. If the frame is blank, open it in a new tab.</p>
        <div class="frame-wrap">
          <iframe src="${escapeAttr(target)}" title="Arcade Browser"></iframe>
        </div>
        <a class="btn ghost" href="${escapeAttr(target)}" target="_blank" rel="noreferrer">Open in new tab</a>
      </section>
    `,
    after: (root) => {
      root.querySelector('[data-web]')?.addEventListener('submit', (e) => {
        e.preventDefault()
        let next = String(new FormData(e.currentTarget as HTMLFormElement).get('url') || '')
        if (/crazygames/i.test(next)) {
          location.hash = '#/crazy'
          return
        }
        if (/poki/i.test(next)) {
          location.hash = '#/poki'
          return
        }
        if (next && !/^https?:\/\//i.test(next)) {
          next = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(next)}`
        }
        location.hash = `#/web?url=${encodeURIComponent(next)}`
      })
    },
  }
}

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}
