import { catalog, playableGames } from './catalog.ts'

export function youtubeView(videoId: string | null): string {
  const picks = catalog.filter((item) => item.videoId)
  const current = videoId || picks[0]?.videoId || 'MmB9b5njVbA'
  return `
    <div class="tube">
      <form class="tube-search" data-youtube-search>
        <input name="q" placeholder="Search game videos" />
        <button type="submit">Search</button>
      </form>
      <div class="tube-player">
        <iframe
          src="https://www.youtube.com/embed/${current}?rel=0"
          title="YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
      <div class="tube-list">
        ${picks
          .map(
            (item) => `
          <a class="tube-row ${item.videoId === current ? 'on' : ''}" href="#/app/youtube?v=${item.videoId}">
            <span>${item.emoji}</span>
            <span>${item.title}</span>
          </a>`,
          )
          .join('')}
      </div>
    </div>`
}

const clips = [
  {
    user: '@sparkkid',
    cap: 'Space Waves ate me at the first spike. Hold longer.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    user: '@orbcatcher',
    cap: 'When the generated game actually slaps.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    user: '@neonbox',
    cap: 'Pong at 1am hits different.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    user: '@tilewitch',
    cap: '2048 is a lifestyle, not a game.',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
]

export function clipsView(): string {
  return `
    <div class="clips" data-clips>
      ${clips
        .map(
          (clip, i) => `
        <section class="clip" data-clip="${i}">
          <video src="${clip.src}" loop muted playsinline autoplay></video>
          <div class="clip-meta">
            <strong>${clip.user}</strong>
            <p>${clip.cap}</p>
          </div>
          <div class="clip-rail">
            <button data-like>♡</button>
            <button data-next>↑</button>
          </div>
        </section>`,
        )
        .join('')}
    </div>`
}

export function bindClips(root: HTMLElement): void {
  const clipsRoot = root.querySelector<HTMLElement>('[data-clips]')
  if (!clipsRoot) return
  const sections = [...clipsRoot.querySelectorAll<HTMLElement>('.clip')]
  const playVisible = () => {
    sections.forEach((section) => {
      const video = section.querySelector('video')
      if (!video) return
      const rect = section.getBoundingClientRect()
      const on = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.3
      if (on) void video.play()
      else video.pause()
    })
  }
  clipsRoot.addEventListener('scroll', playVisible)
  playVisible()
  clipsRoot.addEventListener('click', (e) => {
    const like = (e.target as HTMLElement).closest('[data-like]')
    if (like) {
      like.classList.toggle('on')
      like.textContent = like.classList.contains('on') ? '♥' : '♡'
    }
    const next = (e.target as HTMLElement).closest('[data-next]')
    if (next) {
      clipsRoot.scrollBy({ top: clipsRoot.clientHeight, behavior: 'smooth' })
    }
  })
}

export function phoneView(): string {
  return `
    <div class="dialer">
      <p class="dial-screen" data-dial></p>
      <div class="pad">
        ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
          .map((n) => `<button data-digit="${n}">${n}</button>`)
          .join('')}
      </div>
      <div class="dial-actions">
        <button class="call" data-call>Call</button>
        <button data-clear>Clear</button>
      </div>
      <p class="hint">Try 1234 — Waves picks up.</p>
    </div>`
}

export function bindPhone(root: HTMLElement): () => void {
  const screen = root.querySelector<HTMLElement>('[data-dial]')
  if (!screen) return () => {}
  let n = ''
  const paint = () => {
    screen.textContent = n || 'Call someone in the arcade'
  }
  paint()
  const onClick = (e: Event) => {
    const t = e.target as HTMLElement
    const d = t.closest<HTMLElement>('[data-digit]')
    if (d?.dataset.digit) {
      n += d.dataset.digit
      paint()
    }
    if (t.closest('[data-clear]')) {
      n = ''
      paint()
    }
    if (t.closest('[data-call]')) {
      const who = n === '1234' ? 'Waves' : n === '0000' ? 'the Arcade concierge' : 'a busy bot'
      screen.textContent = `Calling ${who}…`
      setTimeout(() => {
        screen.textContent =
          who === 'Waves'
            ? 'Waves: hold to climb. let go to dive. stop calling mid-tunnel.'
            : 'No answer. They are in a boss fight.'
      }, 900)
    }
  }
  root.addEventListener('click', onClick)
  return () => root.removeEventListener('click', onClick)
}

export function messagesView(): string {
  return `
    <div class="chat" data-chat>
      <div class="bubbles" data-bubbles>
        <p class="bot">Hey. I am the Arcade concierge. Ask for a game.</p>
      </div>
      <form data-chat-form>
        <input name="m" placeholder="something chill / hard / snake" />
        <button type="submit">Send</button>
      </form>
    </div>`
}

export function bindMessages(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]')
  const bubbles = root.querySelector<HTMLElement>('[data-bubbles]')
  if (!form || !bubbles) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = form.elements.namedItem('m') as HTMLInputElement
    const text = input.value.trim()
    if (!text) return
    bubbles.insertAdjacentHTML('beforeend', `<p class="me">${escapeHtml(text)}</p>`)
    input.value = ''
    const q = text.toLowerCase()
    const hit =
      playableGames.find((g) => g.tags.some((t) => q.includes(t)) || g.title.toLowerCase().includes(q)) ||
      playableGames[Math.floor(Math.random() * playableGames.length)]
    bubbles.insertAdjacentHTML(
      'beforeend',
      `<p class="bot">Play <a href="${hit.route}">${hit.title}</a> — ${hit.blurb}</p>`,
    )
    bubbles.scrollTop = bubbles.scrollHeight
  })
}

export function notesView(): string {
  const saved = localStorage.getItem('arcadeos-notes') || ''
  return `
    <div class="notes">
      <textarea data-notes placeholder="Game ideas, cheat codes, snack list.">${escapeHtml(saved)}</textarea>
    </div>`
}

export function bindNotes(root: HTMLElement): void {
  const area = root.querySelector<HTMLTextAreaElement>('[data-notes]')
  area?.addEventListener('input', () => {
    localStorage.setItem('arcadeos-notes', area.value)
  })
}

export function calculatorView(): string {
  return `
    <div class="calc">
      <p class="calc-out" data-calc-out>0</p>
      <div class="calc-grid">
        ${['C', '/', '*', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '%', 'go']
          .map((k) => `<button data-k="${k}">${k}</button>`)
          .join('')}
      </div>
    </div>`
}

export function bindCalc(root: HTMLElement): void {
  const out = root.querySelector<HTMLElement>('[data-calc-out]')
  if (!out) return
  let expr = ''
  root.addEventListener('click', (e) => {
    const k = (e.target as HTMLElement).closest<HTMLElement>('[data-k]')?.dataset.k
    if (!k) return
    if (k === 'C') expr = ''
    else if (k === '⌫') expr = expr.slice(0, -1)
    else if (k === '=' || k === 'go') {
      try {
        const safe = expr.replace(/[^\d.+\-*/%]/g, '')
        expr = String(Function(`"use strict"; return (${safe || 0})`)())
      } catch {
        expr = 'err'
      }
    } else expr += k
    out.textContent = expr || '0'
  })
}

export function musicView(): string {
  return `
    <div class="beats">
      <p>Tap a pad. Make a terrible anthem.</p>
      <div class="pads">
        ${['C', 'D', 'E', 'G', 'A', 'C2', 'kick', 'hat']
          .map((p) => `<button data-pad="${p}">${p}</button>`)
          .join('')}
      </div>
    </div>`
}

export function bindMusic(root: HTMLElement): () => void {
  let ctx: AudioContext | null = null
  const onClick = (e: Event) => {
    const pad = (e.target as HTMLElement).closest<HTMLElement>('[data-pad]')?.dataset.pad
    if (!pad) return
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const map: Record<string, number> = { C: 261, D: 293, E: 329, G: 392, A: 440, C2: 523, kick: 80, hat: 900 }
    osc.frequency.value = map[pad] || 300
    osc.type = pad === 'hat' ? 'square' : pad === 'kick' ? 'sine' : 'triangle'
    gain.gain.setValueAtTime(0.16, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.26)
  }
  root.addEventListener('click', onClick)
  return () => {
    root.removeEventListener('click', onClick)
    void ctx?.close()
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export { escapeHtml }
