/**
 * Header.jsx — Desktop top nav + mobile bottom nav
 * Tabs: Create | Calendar | Waterfall | Library | GSB
 */

const TABS = [
  { id: 'create',    label: 'Create',    emoji: '✨', shortcut: 'c' },
  { id: 'calendar',  label: 'Calendar',  emoji: '📅', shortcut: 'k' },
  { id: 'waterfall', label: 'Waterfall', emoji: '🌊', shortcut: 'w' },
  { id: 'library',   label: 'Library',   emoji: '📚', shortcut: 'l' },
  { id: 'gsb',       label: 'GSB',       emoji: '📊', shortcut: 'g' },
]

export default function Header({ activePage, setActivePage }) {
  return (
    <>
      {/* ── Desktop top header ───────────────────────────────────── */}
      <header
        className="hidden sm:flex items-center justify-between px-6 py-3 sticky top-0 z-50"
        style={{
          background: 'white',
          borderBottom: '1px solid #DDD3C2',
          boxShadow: '0 1px 8px rgba(44,36,22,0.06)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>🌸</span>
          <div>
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                color: '#2C2416',
                fontSize: '1.1rem',
              }}
            >
              Radhika
            </span>
            <span style={{ color: '#A89880', fontSize: '0.75rem', marginLeft: '6px' }}>
              Content Studio
            </span>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                background: activePage === tab.id ? '#D8F3DC' : 'transparent',
                color: activePage === tab.id ? '#2D6A4F' : '#6B5B45',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activePage === tab.id ? 600 : 400,
              }}
              title={`${tab.label} (${tab.shortcut.toUpperCase()})`}
            >
              <span className="mr-1.5">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Mobile bottom nav ────────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: 'white',
          borderTop: '1px solid #DDD3C2',
          boxShadow: '0 -2px 12px rgba(44,36,22,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: activePage === tab.id ? '#2D6A4F' : '#A89880',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{tab.emoji}</span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: activePage === tab.id ? 600 : 400,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {tab.label}
            </span>
            {activePage === tab.id && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: `${100 / TABS.length}%`,
                  height: '2px',
                  background: '#2D6A4F',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </>
  )
}
