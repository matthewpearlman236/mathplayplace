import type { GenConfig } from './generator.ts'
import { mountBottleFlip } from './bottleFlip.ts'
import { mountFootballBros } from './footballBros.ts'
import { mountSpaceWaves } from './spaceWaves.ts'

export type Unmount = () => void

function onViewResize(fn: () => void): () => void {
  window.addEventListener('resize', fn)
  window.addEventListener('orientationchange', fn)
  window.visualViewport?.addEventListener('resize', fn)
  return () => {
    window.removeEventListener('resize', fn)
    window.removeEventListener('orientationchange', fn)
    window.visualViewport?.removeEventListener('resize', fn)
  }
}

function bindSwipe(el: HTMLElement, onDir: (dir: { x: number; y: number }) => void): () => void {
  let x = 0
  let y = 0
  const down = (e: PointerEvent) => {
    x = e.clientX
    y = e.clientY
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }
  const up = (e: PointerEvent) => {
    const dx = e.clientX - x
    const dy = e.clientY - y
    if (Math.hypot(dx, dy) < 28) return
    if (Math.abs(dx) > Math.abs(dy)) onDir({ x: dx > 0 ? 1 : -1, y: 0 })
    else onDir({ x: 0, y: dy > 0 ? 1 : -1 })
  }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointerup', up)
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointerup', up)
  }
}

function canvasGame(
  host: HTMLElement,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => Unmount,
): Unmount {
  const canvas = document.createElement('canvas')
  canvas.className = 'play-canvas'
  host.append(canvas)

  const fit = () => {
    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(280, Math.floor(rect.width * dpr))
    canvas.height = Math.max(180, Math.floor(rect.height * dpr))
    canvas.style.width = `${Math.max(1, rect.width)}px`
    canvas.style.height = `${Math.max(1, rect.height)}px`
  }
  fit()
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => canvas.remove()
  const inner = draw(ctx, canvas)
  const stopResize = onViewResize(fit)
  return () => {
    stopResize()
    inner()
    canvas.remove()
  }
}

export function mountSnake(host: HTMLElement): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    const grid = 20
    let cells = 24
    let snake = [{ x: 8, y: 12 }]
    let dir = { x: 1, y: 0 }
    let pending = { x: 1, y: 0 }
    let food = { x: 16, y: 12 }
    let alive = true
    let acc = 0
    let last = performance.now()
    let score = 0
    let raf = 0

    const placeFood = () => {
      cells = Math.floor(Math.min(canvas.width, canvas.height) / (grid * (window.devicePixelRatio || 1)))
      cells = Math.max(16, Math.min(28, cells))
      food = {
        x: Math.floor(Math.random() * cells),
        y: Math.floor(Math.random() * cells),
      }
    }
    placeFood()

    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }
      const next = map[e.key] || map[e.key.toLowerCase()]
      if (!next) return
      if (next.x === -dir.x && next.y === -dir.y) return
      pending = next
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    const unswipe = bindSwipe(canvas, (next) => {
      if (next.x === -dir.x && next.y === -dir.y) return
      pending = next
    })

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = now - last
      last = now
      acc += dt
      const step = 110
      if (alive && acc >= step) {
        acc = 0
        dir = pending
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= cells ||
          head.y >= cells ||
          snake.some((s) => s.x === head.x && s.y === head.y)
        ) {
          alive = false
        } else {
          snake.unshift(head)
          if (head.x === food.x && head.y === food.y) {
            score += 1
            placeFood()
          } else {
            snake.pop()
          }
        }
      }

      const w = canvas.width
      const h = canvas.height
      const size = Math.min(w, h) * 0.9
      const ox = (w - size) / 2
      const oy = (h - size) / 2
      const cell = size / cells
      ctx.fillStyle = '#0c1018'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#141c28'
      ctx.fillRect(ox, oy, size, size)
      ctx.fillStyle = '#6ef7ff'
      ctx.beginPath()
      ctx.arc(ox + food.x * cell + cell / 2, oy + food.y * cell + cell / 2, cell * 0.32, 0, Math.PI * 2)
      ctx.fill()
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#ff2f92' : '#c084fc'
        ctx.fillRect(ox + s.x * cell + 2, oy + s.y * cell + 2, cell - 4, cell - 4)
      })
      ctx.fillStyle = '#f4f1ff'
      ctx.font = `${Math.floor(h * 0.04)}px IBM Plex Sans, sans-serif`
      ctx.fillText(alive ? `Score ${score}` : `Game over · ${score}  (swipe / arrows)`, 24, 36)
      if (!alive) {
        snake = [{ x: 8, y: 12 }]
        dir = { x: 1, y: 0 }
        pending = { x: 1, y: 0 }
        alive = true
        score = 0
        acc = -600
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      unswipe()
    }
  })
}

export function mountFlap(host: HTMLElement): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    let y = 0.45
    let vy = 0
    let x = 0
    let dead = false
    let score = 0
    let raf = 0
    const gates = [
      { x: 1.2, gap: 0.42 },
      { x: 1.85, gap: 0.55 },
    ]
    const flap = () => {
      if (dead) {
        y = 0.45
        vy = 0
        x = 0
        dead = false
        score = 0
        gates[0].x = 1.2
        gates[1].x = 1.85
        return
      }
      vy = -0.018
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        flap()
      }
    }
    const onPtr = (e: PointerEvent) => {
      e.preventDefault()
      flap()
    }
    canvas.addEventListener('pointerdown', onPtr)
    window.addEventListener('keydown', onKey)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const w = canvas.width
      const h = canvas.height
      if (!dead) {
        vy += 0.0009
        y += vy
        x += 0.005
        for (const g of gates) {
          g.x -= 0.0065
          if (g.x < -0.12) {
            g.x += 1.4
            g.gap = 0.25 + Math.random() * 0.5
            score += 1
          }
          const px = 0.28
          const py = y
          const hitX = px > g.x && px < g.x + 0.1
          const inGap = py > g.gap - 0.16 && py < g.gap + 0.16
          if (hitX && !inGap) dead = true
        }
        if (y < 0 || y > 1) dead = true
      }
      ctx.fillStyle = '#102018'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#163022'
      ctx.fillRect(0, h * 0.88, w, h)
      for (const g of gates) {
        ctx.fillStyle = '#d6ff4a'
        ctx.fillRect(g.x * w, 0, 0.1 * w, (g.gap - 0.16) * h)
        ctx.fillRect(g.x * w, (g.gap + 0.16) * h, 0.1 * w, h)
      }
      ctx.fillStyle = dead ? '#ff5d8f' : '#6ef7ff'
      ctx.fillRect(0.26 * w, y * h - 16, 32, 32)
      ctx.fillStyle = '#f4f1ff'
      ctx.font = `${Math.floor(h * 0.045)}px IBM Plex Sans, sans-serif`
      ctx.fillText(dead ? `Crashed · ${score}  tap to retry` : `${score}`, 24, 40)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onPtr)
      window.removeEventListener('keydown', onKey)
    }
  })
}

export function mountPong(host: HTMLElement): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    let py = 0.5
    let ey = 0.5
    let bx = 0.5
    let by = 0.5
    let bvx = 0.008
    let bvy = 0.004
    let you = 0
    let bot = 0
    let raf = 0
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      py = (e.clientY - rect.top) / rect.height
    }
    const down = (e: PointerEvent) => {
      e.preventDefault()
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      move(e)
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', down)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const w = canvas.width
      const h = canvas.height
      bx += bvx
      by += bvy
      if (by < 0.03 || by > 0.97) bvy *= -1
      ey += (by - ey) * 0.065
      const paddle = (px: number, padY: number) =>
        bx > px - 0.02 && bx < px + 0.02 && Math.abs(by - padY) < 0.1
      if (paddle(0.08, py) && bvx < 0) {
        bvx *= -1.05
        bvy += (by - py) * 0.04
      }
      if (paddle(0.92, ey) && bvx > 0) {
        bvx *= -1.05
        bvy += (by - ey) * 0.04
      }
      if (bx < 0) {
        bot += 1
        bx = 0.5
        bvx = 0.008
      }
      if (bx > 1) {
        you += 1
        bx = 0.5
        bvx = -0.008
      }
      ctx.fillStyle = '#101428'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#2a3558'
      for (let i = 0; i < 12; i++) ctx.fillRect(w / 2 - 4, i * (h / 12) + 8, 8, h / 24)
      ctx.fillStyle = '#7aa2ff'
      ctx.fillRect(0.05 * w, (py - 0.1) * h, 0.018 * w, 0.2 * h)
      ctx.fillStyle = '#ff2f92'
      ctx.fillRect(0.932 * w, (ey - 0.1) * h, 0.018 * w, 0.2 * h)
      ctx.fillStyle = '#f4f1ff'
      ctx.beginPath()
      ctx.arc(bx * w, by * h, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = `${Math.floor(h * 0.06)}px Syne, sans-serif`
      ctx.fillText(`${you}   ${bot}`, w / 2 - 50, 48)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', down)
    }
  })
}

export function mountBreakout(host: HTMLElement): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    const cols = 8
    const rows = 5
    let bricks = Array.from({ length: cols * rows }, (_, i) => ({
      i,
      live: true,
    }))
    let px = 0.5
    let bx = 0.5
    let by = 0.72
    let bvx = 0.006
    let bvy = -0.007
    let raf = 0
    let lives = 3
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      px = (e.clientX - rect.left) / rect.width
    }
    const down = (e: PointerEvent) => {
      e.preventDefault()
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      move(e)
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', down)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const w = canvas.width
      const h = canvas.height
      bx += bvx
      by += bvy
      if (bx < 0.03 || bx > 0.97) bvx *= -1
      if (by < 0.04) bvy *= -1
      if (by > 0.88 && Math.abs(bx - px) < 0.1 && bvy > 0) {
        bvy *= -1
        bvx += (bx - px) * 0.04
      }
      if (by > 1.05) {
        lives -= 1
        bx = 0.5
        by = 0.72
        bvy = -0.007
        if (lives <= 0) {
          bricks = bricks.map((b) => ({ ...b, live: true }))
          lives = 3
        }
      }
      const bw = 0.1
      const bh = 0.05
      for (const brick of bricks) {
        if (!brick.live) continue
        const c = brick.i % cols
        const r = Math.floor(brick.i / cols)
        const x = 0.08 + c * 0.11
        const y = 0.12 + r * 0.07
        if (bx > x && bx < x + bw && by > y && by < y + bh) {
          brick.live = false
          bvy *= -1
        }
      }
      ctx.fillStyle = '#1a0e0a'
      ctx.fillRect(0, 0, w, h)
      bricks.forEach((brick) => {
        if (!brick.live) return
        const c = brick.i % cols
        const r = Math.floor(brick.i / cols)
        ctx.fillStyle = ['#ff7a3d', '#ffd166', '#ff2f92', '#6ef7ff', '#c084fc'][r]
        ctx.fillRect((0.08 + c * 0.11) * w, (0.12 + r * 0.07) * h, 0.1 * w - 6, 0.05 * h - 6)
      })
      ctx.fillStyle = '#f4f1ff'
      ctx.fillRect((px - 0.1) * w, 0.9 * h, 0.2 * w, 0.025 * h)
      ctx.beginPath()
      ctx.arc(bx * w, by * h, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = `${Math.floor(h * 0.035)}px IBM Plex Sans, sans-serif`
      ctx.fillText(`Lives ${lives}`, 20, 36)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', down)
    }
  })
}

export function mountMemory(host: HTMLElement): Unmount {
  const wrap = document.createElement('div')
  wrap.className = 'memory-wrap'
  const icons = ['⚡', '🐍', '🧱', '🎯', '🌙', '🔥', '🍓', '🏓']
  const deck = [...icons, ...icons]
    .map((icon, i) => ({ icon, i, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
  let open: number[] = []
  let locked = false
  let matched = new Set<number>()
  const render = () => {
    wrap.innerHTML = deck
      .map(
        (card, idx) =>
          `<button class="mem-card ${matched.has(idx) || open.includes(idx) ? 'up' : ''}" data-i="${idx}">${
            matched.has(idx) || open.includes(idx) ? card.icon : ''
          }</button>`,
      )
      .join('')
  }
  wrap.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-i]')
    if (!btn || locked) return
    const i = Number(btn.dataset.i)
    if (matched.has(i) || open.includes(i)) return
    open.push(i)
    render()
    if (open.length === 2) {
      const [a, b] = open
      if (deck[a].icon === deck[b].icon) {
        matched.add(a)
        matched.add(b)
        open = []
        render()
      } else {
        locked = true
        setTimeout(() => {
          open = []
          locked = false
          render()
        }, 700)
      }
    }
  })
  host.append(wrap)
  render()
  return () => wrap.remove()
}

export function mountTap(host: HTMLElement): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    type Orb = { x: number; y: number; r: number; life: number }
    let orbs: Orb[] = []
    let score = 0
    let time = 30
    let raf = 0
    let last = performance.now()
    const spawn = () => {
      orbs.push({
        x: 0.12 + Math.random() * 0.76,
        y: 0.18 + Math.random() * 0.7,
        r: 0.04 + Math.random() * 0.03,
        life: 1,
      })
    }
    spawn()
    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const hit = orbs.findIndex((o) => Math.hypot(o.x - x, o.y - y) < o.r + 0.02)
      if (hit >= 0) {
        score += 1
        orbs.splice(hit, 1)
      }
    }
    canvas.addEventListener('pointerdown', onClick)
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = (now - last) / 1000
      last = now
      if (time > 0) {
        time -= dt
        if (Math.random() < dt * 1.6) spawn()
        orbs.forEach((o) => {
          o.life -= dt * 0.7
        })
        orbs = orbs.filter((o) => o.life > 0)
      }
      const w = canvas.width
      const h = canvas.height
      ctx.fillStyle = '#1a0a14'
      ctx.fillRect(0, 0, w, h)
      for (const o of orbs) {
        ctx.fillStyle = `rgba(255, 47, 146, ${o.life})`
        ctx.beginPath()
        ctx.arc(o.x * w, o.y * h, o.r * w, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#f4f1ff'
      ctx.font = `${Math.floor(h * 0.04)}px IBM Plex Sans, sans-serif`
      ctx.fillText(
        time > 0 ? `${Math.ceil(time)}s · ${score}` : `Done · ${score}  click to restart`,
        20,
        40,
      )
    }
    canvas.addEventListener('pointerdown', () => {
      if (time <= 0) {
        score = 0
        time = 30
        orbs = []
      }
    })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onClick)
    }
  })
}

export function mountMerge(host: HTMLElement): Unmount {
  const wrap = document.createElement('div')
  wrap.className = 'merge-wrap'
  let board = Array.from({ length: 16 }, () => 0)
  const empty = () => board.flatMap((v, i) => (v === 0 ? [i] : []))
  const spawn = () => {
    const spots = empty()
    if (!spots.length) return
    board[spots[Math.floor(Math.random() * spots.length)]] = Math.random() < 0.9 ? 2 : 4
  }
  spawn()
  spawn()
  const slide = (row: number[]) => {
    const nums = row.filter((n) => n)
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] === nums[i + 1]) {
        nums[i] *= 2
        nums[i + 1] = 0
      }
    }
    const compact = nums.filter((n) => n)
    while (compact.length < 4) compact.push(0)
    return compact
  }
  const move = (dir: 'l' | 'r' | 'u' | 'd') => {
    const next = [...board]
    const read = (c: number, r: number) => next[r * 4 + c]
    const write = (c: number, r: number, v: number) => {
      next[r * 4 + c] = v
    }
    if (dir === 'l' || dir === 'r') {
      for (let r = 0; r < 4; r++) {
        let row = [read(0, r), read(1, r), read(2, r), read(3, r)]
        if (dir === 'r') row = row.reverse()
        row = slide(row)
        if (dir === 'r') row = row.reverse()
        row.forEach((v, c) => write(c, r, v))
      }
    } else {
      for (let c = 0; c < 4; c++) {
        let col = [read(c, 0), read(c, 1), read(c, 2), read(c, 3)]
        if (dir === 'd') col = col.reverse()
        col = slide(col)
        if (dir === 'd') col = col.reverse()
        col.forEach((v, r) => write(c, r, v))
      }
    }
    if (next.some((v, i) => v !== board[i])) {
      board = next
      spawn()
      paint()
    }
  }
  const paint = () => {
    wrap.innerHTML = board
      .map((n) => `<div class="tile t-${n}">${n || ''}</div>`)
      .join('')
  }
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, 'l' | 'r' | 'u' | 'd'> = {
      ArrowLeft: 'l',
      ArrowRight: 'r',
      ArrowUp: 'u',
      ArrowDown: 'd',
      a: 'l',
      d: 'r',
      w: 'u',
      s: 'd',
    }
    const dir = map[e.key] || map[e.key.toLowerCase()]
    if (!dir) return
    e.preventDefault()
    move(dir)
  }
  window.addEventListener('keydown', onKey)
  host.append(wrap)
  paint()
  const unswipe = bindSwipe(wrap, (d) => {
    if (d.x === -1) move('l')
    if (d.x === 1) move('r')
    if (d.y === -1) move('u')
    if (d.y === 1) move('d')
  })
  return () => {
    window.removeEventListener('keydown', onKey)
    unswipe()
    wrap.remove()
  }
}

export function mountGenerated(host: HTMLElement, config: GenConfig): Unmount {
  return canvasGame(host, (ctx, canvas) => {
    let x = 0.2
    let y = 0.5
    let vy = 0
    let score = 0
    let raf = 0
    const keys = { l: false, r: false, j: false }
    const bits = Array.from({ length: config.goal }, (_, i) => ({
      x: 0.3 + (i * 0.6) / config.goal,
      y: 0.35 + (i % 3) * 0.18,
      got: false,
    }))
    const hazards = Array.from({ length: 4 }, (_, i) => ({
      x: 0.4 + i * 0.15,
      y: 0.2,
      vy: 0.003 + i * 0.001,
    }))
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.l = down
      if (e.key === 'ArrowRight' || e.key === 'd') keys.r = down
      if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'Space') {
        keys.j = down
        if (down) e.preventDefault()
      }
    }
    const down = (e: KeyboardEvent) => onKey(e, true)
    const up = (e: KeyboardEvent) => onKey(e, false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    const follow = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      x = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width))
      if (e.type === 'pointerdown' && y > 0.72) vy = -0.018
    }
    const ptrDown = (e: PointerEvent) => {
      e.preventDefault()
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      follow(e)
    }
    canvas.addEventListener('pointerdown', ptrDown)
    canvas.addEventListener('pointermove', follow)
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (keys.l) x -= config.speed
      if (keys.r) x += config.speed
      vy += config.gravity
      if (keys.j && y > 0.82) vy = -0.018
      y += vy
      if (y > 0.84) {
        y = 0.84
        vy = 0
      }
      x = Math.max(0.04, Math.min(0.96, x))
      for (const b of bits) {
        if (!b.got && Math.hypot(b.x - x, b.y - y) < 0.05) {
          b.got = true
          score += 1
        }
      }
      for (const h of hazards) {
        h.y += h.vy
        if (h.y > 0.9 || h.y < 0.1) h.vy *= -1
        if (Math.hypot(h.x - x, h.y - y) < 0.045) {
          score = Math.max(0, score - 1)
          x = 0.2
          y = 0.5
        }
      }
      const w = canvas.width
      const hgt = canvas.height
      ctx.fillStyle = config.bg
      ctx.fillRect(0, 0, w, hgt)
      ctx.fillStyle = '#ffffff18'
      ctx.fillRect(0, hgt * 0.88, w, hgt)
      bits.forEach((b) => {
        if (b.got) return
        ctx.fillStyle = config.collectColor
        ctx.beginPath()
        ctx.arc(b.x * w, b.y * hgt, 10, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.fillStyle = config.hazardColor
      hazards.forEach((hz) => {
        ctx.fillRect(hz.x * w - 10, hz.y * hgt - 10, 20, 20)
      })
      ctx.fillStyle = config.playerColor
      ctx.fillRect(x * w - 14, y * hgt - 14, 28, 28)
      ctx.fillStyle = '#f4f1ff'
      ctx.font = `${Math.floor(hgt * 0.038)}px IBM Plex Sans, sans-serif`
      ctx.fillText(
        `${score}/${config.goal}  ${score >= config.goal ? 'YOU WIN' : 'Drag to move · tap ground to jump'}`,
        20,
        36,
      )
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      canvas.removeEventListener('pointerdown', ptrDown)
      canvas.removeEventListener('pointermove', follow)
    }
  })
}

export function mountGame(id: string, host: HTMLElement, gen?: GenConfig): Unmount {
  if (id === 'space-waves' || id === 'spark-run') return mountSpaceWaves(host)
  if (id === 'bottle-flip') return mountBottleFlip(host)
  if (id === 'football-bros' || id === 'neon-snake') return mountFootballBros(host)
  if (id === 'box-bounce') return mountFlap(host)
  if (id === 'pulse-pong') return mountPong(host)
  if (id === 'brick-bash') return mountBreakout(host)
  if (id === 'memory-grid') return mountMemory(host)
  if (id === 'tap-rush') return mountTap(host)
  if (id === 'tile-merge') return mountMerge(host)
  if (id === 'generated' && gen) return mountGenerated(host, gen)
  host.innerHTML = `<p class="empty">That game is not installed yet.</p>`
  return () => {
    host.innerHTML = ''
  }
}
