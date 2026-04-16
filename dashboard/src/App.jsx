import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CreatePage from './pages/CreatePage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import WaterfallPage from './pages/WaterfallPage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import GSBPage from './pages/GSBPage.jsx'
import HelpPage from './pages/HelpPage.jsx'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('radhikaToken'))
  const [activePage, setActivePage] = useState('create')

  // Keyboard shortcuts — c/k/w/l/g to navigate; skip when typing
  useEffect(() => {
    if (!authed) return
    function onKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const map = { c: 'create', k: 'calendar', w: 'waterfall', l: 'library', g: 'gsb', '?': 'help' }
      if (map[e.key]) { e.preventDefault(); setActivePage(map[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [authed])

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF7F2' }}>
      <Header activePage={activePage} setActivePage={setActivePage} />

      {/* Main content — bottom padding on mobile for fixed bottom nav */}
      <main className="flex-1 pb-20 sm:pb-0">
        <div style={{ display: activePage === 'create' ? 'block' : 'none' }}>
          <CreatePage active={activePage === 'create'} onGoToLibrary={() => setActivePage('library')} />
        </div>
        <div style={{ display: activePage === 'calendar' ? 'block' : 'none' }}>
          <CalendarPage active={activePage === 'calendar'} onCreatePost={() => setActivePage('create')} />
        </div>
        <div style={{ display: activePage === 'waterfall' ? 'block' : 'none' }}>
          <WaterfallPage active={activePage === 'waterfall'} onGoToLibrary={() => setActivePage('library')} />
        </div>
        <div style={{ display: activePage === 'library' ? 'block' : 'none' }}>
          <LibraryPage active={activePage === 'library'} />
        </div>
        <div style={{ display: activePage === 'gsb' ? 'block' : 'none' }}>
          <GSBPage active={activePage === 'gsb'} />
        </div>
        <div style={{ display: activePage === 'help' ? 'block' : 'none' }}>
          <HelpPage />
        </div>
      </main>
    </div>
  )
}
