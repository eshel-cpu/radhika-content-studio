import { useState, useEffect } from 'react'
import { theme, PILLARS, getPillar } from '../theme.js'
import PillarBadge from '../components/PillarBadge.jsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage({ active, onCreatePost }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [posts, setPosts] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPosts, setSelectedPosts] = useState([])

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
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                minHeight: '64px',
                borderRadius: '10px',
                background: isSelected ? theme.greenPale : isToday(day) ? theme.goldPale : 'white',
                border: `1.5px solid ${isSelected ? theme.green : isToday(day) ? theme.gold : theme.border}`,
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
