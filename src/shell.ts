import {
  appScreen,
  appsScreen,
  crazyScreen,
  homeScreen,
  labScreen,
  playScreen,
  pokiScreen,
  searchScreen,
  webScreen,
  type ScreenHandle,
} from './screens.ts'

type Route = {
  name: string
  params: URLSearchParams
  parts: string[]
}

function parseHash(): Route {
  const raw = location.hash.replace(/^#/, '') || '/'
  const q = raw.indexOf('?')
  const path = q < 0 ? raw : raw.slice(0, q)
  const query = q < 0 ? '' : raw.slice(q + 1)
  const parts = path.split('/').filter(Boolean)
  return { name: parts[0] || 'home', params: new URLSearchParams(query), parts }
}

function screenFor(route: Route): ScreenHandle {
  if (route.name === 'home' && route.parts.length === 0) return homeScreen()
  if (route.name === 'search') return searchScreen(route.params.get('q') || '')
  if (route.name === 'lab') return labScreen()
  if (route.name === 'play' && route.parts[1]) return playScreen(route.parts[1])
  if (route.name === 'apps') return appsScreen()
  if (route.name === 'app' && route.parts[1]) return appScreen(route.parts[1], route.params)
  if (route.name === 'crazy') return crazyScreen(route.params.get('g') || 'ovo')
  if (route.name === 'poki') {
    return pokiScreen(route.params.get('g') || '', route.params.get('q') || '', route.params.get('make') || '')
  }
  if (route.name === 'web') return webScreen(route.params.get('url') || '')
  return homeScreen()
}

export function mountApp(root: HTMLElement): void {
  let unmount: (() => void) | void

  const chrome = () => {
    root.innerHTML = `
      <div class="os">
        <header class="topbar">
          <a class="logo" href="#/">Mathplayplace</a>
          <nav class="top-links">
            <a href="#/">Games</a>
            <a href="#/search">PlaySearch</a>
            <a href="#/lab">AI Lab</a>
            <a href="#/apps">Apps</a>
            <a href="#/web">Browser</a>
          </nav>
        </header>
        <main class="stage" id="stage"></main>
        <nav class="dock">
          <a href="#/">🎮<span>Games</span></a>
          <a href="#/search">🔎<span>Search</span></a>
          <a href="#/lab">✦<span>Lab</span></a>
          <a href="#/app/clips">▶<span>Clips</span></a>
          <a href="#/apps">▦<span>Apps</span></a>
        </nav>
      </div>
    `
  }

  const render = () => {
    if (!root.querySelector('.os')) chrome()
    const stage = root.querySelector<HTMLElement>('#stage')
    if (!stage) return
    unmount?.()
    const screen = screenFor(parseHash())
    stage.innerHTML = screen.html
    stage.scrollTop = 0
    unmount = screen.after?.(stage)
    document.title = 'Mathplayplace'
  }

  chrome()
  window.addEventListener('hashchange', render)
  render()
}
