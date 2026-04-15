import { useState, useEffect } from 'react'
import { theme, PILLARS, getPillar } from '../theme.js'
import PillarBadge from '../components/PillarBadge.jsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Radhika audience engagement score by day-of-week (0=Sun … 6=Sat, Israel-based)
// Thu/Mon = peak (Israeli audience pre/post Shabbat). Sat = Shabbat (near-zero).
const HEATMAP_DOW = [0.65, 0.90, 0.72, 0.85, 0.92, 0.58, 0.10]
const FORMAT_EMOJI = { reel: '🎬', carousel: '🎠', 'quote-tile': '✨', 'single-image': '📸' }

function heatmapTint(dow) {
  const s = HEATMAP_DOW[dow]
  if (s >= 0.85) return { bg: '#D6F0E020', border: '#2D6A4F40' }
  if (s >= 0.65) return { bg: 'transparent', border: '' }
  if (s >= 0.45) return { bg: '#FFF3CD18', border: '#C9972C30' }
  return { bg: '#FDE8E415', border: '#9B4D3A30' }
}

export default function CalendarPage({ active, onCreatePost }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [posts, setPosts] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPosts, setSelectedPosts] = useState([])
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showGrid, setShowGrid] = useState(false)

  // Load posts from localStorage
  useEffect(() => {
    if (!active) return
    const lib = JSON.parse(localStorage.getItem('radhikaLibrary') || '[]')
    setPosts(lib)
  }, [active])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Map posts to dates
  function getPostsForDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter(p => {
      const postDate = p.scheduledDate || p.createdAt?.slice(0, 10)
      return postDate === dateStr
    })
  }

  function handleDayClick(day) {
    if (!day) return
    const dayPosts = getPostsForDay(day)
    setSelectedDate(day)
    setSelectedPosts(dayPosts)
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
          📅 Content Calendar
        </h1>
        <p style={{ color: theme.mid, fontSize: '0.9rem' }}>
          Posts saved to your Library appear here. Click any day to view or plan.
        </p>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost" style={{ padding: '0.4rem 0.75rem' }}>←</button>
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="btn-ghost" style={{ padding: '0.4rem 0.75rem' }}>→</button>
      </div>

      {/* View toggles */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowHeatmap(h => !h)}
          className="btn-ghost text-xs"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: showHeatmap ? theme.greenPale : '', color: showHeatmap ? theme.green : theme.mid, border: `1px solid ${showHeatmap ? theme.green : theme.border}` }}
        >
          🔥 Best days
        </button>
        <button
          onClick={() => setShowGrid(g => !g)}
          className="btn-ghost text-xs"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: showGrid ? theme.greenPale : '', color: showGrid ? theme.green : theme.mid, border: `1px solid ${showGrid ? theme.green : theme.border}` }}
        >
          📸 Grid preview
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center py-1 text-xs font-semibold" style={{ color: theme.muted }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dayPosts = getPostsForDay(day)
          const isSelected = selectedDate === day
          const dow = (firstDay + day - 1) % 7
          const tint = showHeatmap && !isSelected && !isToday(day) ? heatmapTint(dow) : { bg: '', border: '' }
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                minHeight: '64px',
                borderRadius: '10px',
                background: isSelected ? theme.greenPale : isToday(day) ? theme.goldPale : tint.bg || 'white',
                border: `1.5px solid ${isSelected ? theme.green : isToday(day) ? theme.gold : tint.border || theme.border}`,
                cursor: 'pointer',
                padding: '6px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: isToday(day) ? 700 : 500,
                  color: isSelected ? theme.green : isToday(day) ? '#8B6914' : theme.dark,
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: isToday(day) && !isSelected ? theme.gold + '20' : 'transparent',
                }}
              >
                {day}
              </span>
              {/* Pillar dots */}
              <div className="flex flex-wrap justify-center gap-0.5">
                {dayPosts.slice(0, 3).map((p, idx) => {
                  const pillar = getPillar(p.pillar)
                  return (
                    <div
                      key={idx}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: pillar.color,
                      }}
                    />
                  )
                })}
                {dayPosts.length > 3 && (
                  <span style={{ fontSize: '0.55rem', color: theme.muted }}>+{dayPosts.length - 3}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="card slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
              {MONTHS[month]} {selectedDate}
            </h3>
            <button
              onClick={onCreatePost}
              className="btn-green text-sm"
              style={{ padding: '0.375rem 0.875rem', fontSize: '0.85rem' }}
            >
              + Create post
            </button>
          </div>

          {selectedPosts.length === 0 ? (
            <p style={{ color: theme.muted, fontSize: '0.9rem' }}>
              No posts scheduled. Click "Create post" to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedPosts.map(post => (
                <div
                  key={post.id}
                  style={{
                    background: theme.cream,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PillarBadge pillarId={post.pillar} />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: post.status === 'posted' ? theme.green : theme.gold,
                        fontWeight: 600,
                      }}
                    >
                      {post.status === 'posted' ? '✓ Posted' : post.status === 'ready' ? '● Ready' : '○ Draft'}
                    </span>
                  </div>
                  <p style={{ color: theme.mid, fontSize: '0.85rem', margin: 0 }}>
                    {post.intent}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IG Grid Preview */}
      {showGrid && (
        <div className="card mt-4 mb-4">
          <h3 className="font-semibold text-sm mb-1" style={{ color: theme.dark }}>📸 Feed Preview</h3>
          <p className="text-xs mb-3" style={{ color: theme.muted }}>How your feed will look — newest post top-left</p>
          {posts.length === 0 ? (
            <p style={{ color: theme.muted, fontSize: '0.85rem' }}>No saved posts yet. Create and save posts to see your feed preview.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
              {posts.slice(0, 9).map((post, i) => {
                const pillar = getPillar(post.pillar)
                const emoji = FORMAT_EMOJI[post.format] || '📸'
                return (
                  <div
                    key={post.id || i}
                    title={post.intent}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '6px',
                      background: pillar.color + '30',
                      border: `2px solid ${pillar.color}50`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.55rem', color: pillar.color, fontWeight: 600, textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {post.intent}
                    </span>
                    <span style={{ fontSize: '0.5rem', color: post.status === 'posted' ? theme.green : theme.muted }}>
                      {post.status === 'posted' ? '✓ Posted' : post.status === 'ready' ? '● Ready' : '○ Draft'}
                    </span>
                  </div>
                )
              })}
              {posts.length < 9 && Array.from({ length: 9 - posts.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ aspectRatio: '1', borderRadius: '6px', background: theme.creamDark, border: `2px dashed ${theme.border}` }} />
              ))}
            </div>
          )}
          <p className="text-xs mt-2" style={{ color: theme.muted }}>
            Tip: Alternate pillar colors for visual variety. Avoid 3 same-color posts in a row.
          </p>
        </div>
      )}

      {/* Heatmap legend */}
      {showHeatmap && (
        <div className="flex flex-wrap gap-3 mb-4 mt-2">
          <span className="text-xs" style={{ color: theme.muted }}>Best days:</span>
          {DAYS.map((d, i) => {
            const s = HEATMAP_DOW[i]
            const label = s >= 0.85 ? 'Peak' : s >= 0.65 ? 'Good' : s >= 0.45 ? 'Avg' : 'Avoid'
            const color = s >= 0.85 ? theme.green : s >= 0.65 ? theme.mid : s >= 0.45 ? '#C9972C' : '#9B4D3A'
            return (
              <span key={d} className="text-xs" style={{ color }}>
                {d}: {label}
              </span>
            )
          })}
        </div>
      )}

      {/* Pillar legend */}
      <div className="mt-4">
        <p className="text-xs mb-2" style={{ color: theme.muted }}>Pillar legend</p>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: '0.75rem', color: theme.mid }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
