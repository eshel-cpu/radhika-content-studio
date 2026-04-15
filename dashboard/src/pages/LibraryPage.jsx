import { useState, useEffect } from 'react'
import { theme, PILLARS, FORMATS, getPillar } from '../theme.js'
import PillarBadge from '../components/PillarBadge.jsx'
import { apiFetch } from '../api.js'

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft', color: theme.muted },
  { id: 'ready', label: 'Ready', color: theme.gold },
  { id: 'posted', label: 'Posted', color: theme.green },
]

export default function LibraryPage({ active }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterPillar, setFilterPillar] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [copied, setCopied] = useState('')
  const [statusLoading, setStatusLoading] = useState({})

  useEffect(() => {
    if (!active) return
    load()
  }, [active])

  async function load() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/library')
      if (!res) return
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (e) {
      console.error('[Library] load error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(post, status) {
    const id = post.notionPageId || post.id
    setStatusLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await apiFetch(`/api/library/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (!res) return
      setPosts(prev => prev.map(p =>
        (p.notionPageId || p.id) === id ? { ...p, status } : p
      ))
    } catch (e) {
      console.error('[Library] status update error:', e)
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const filtered = posts.filter(p => {
    if (filterPillar !== 'all' && p.pillar !== filterPillar) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  const statusColor = { draft: theme.muted, ready: theme.gold, posted: theme.green }
  const statusEmoji = { draft: '○', ready: '●', posted: '✓' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
            📚 Library
          </h1>
          <p style={{ color: theme.mid, fontSize: '0.9rem' }}>
            {loading ? 'Loading...' : `${posts.length} saved ${posts.length === 1 ? 'post' : 'posts'} · Synced to Notion`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: 'none',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            color: theme.mid,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? '⏳' : '↻ Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterPillar('all')}
            className="px-3 py-1 rounded-full text-sm transition-all"
            style={{
              background: filterPillar === 'all' ? theme.dark : theme.creamDark,
              color: filterPillar === 'all' ? 'white' : theme.mid,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: filterPillar === 'all' ? 600 : 400,
            }}
          >
            All pillars
          </button>
          {PILLARS.map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPillar(p.id)}
              className="px-3 py-1 rounded-full text-sm transition-all"
              style={{
                background: filterPillar === p.id ? p.bgColor : theme.creamDark,
                color: filterPillar === p.id ? p.color : theme.mid,
                border: `1px solid ${filterPillar === p.id ? p.color : theme.border}`,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: filterPillar === p.id ? 600 : 400,
              }}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className="px-3 py-1 rounded-full text-sm transition-all"
              style={{
                background: filterStatus === s.id ? (s.id === 'all' ? theme.dark : `${s.color}20`) : theme.creamDark,
                color: filterStatus === s.id ? (s.id === 'all' ? 'white' : s.color) : theme.muted,
                border: `1px solid ${filterStatus === s.id && s.id !== 'all' ? s.color : theme.border}`,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: filterStatus === s.id ? 600 : 400,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      {loading ? (
        <div className="card text-center py-12" style={{ color: theme.muted }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Loading from Notion...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12" style={{ color: theme.muted }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p className="font-medium mb-1" style={{ color: theme.mid }}>
            {posts.length === 0 ? 'No posts yet' : 'No posts match this filter'}
          </p>
          <p className="text-sm">
            {posts.length === 0 ? 'Create your first post in the ✨ Create tab' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const postId = post.notionPageId || post.id
            const isExpanded = expandedId === postId
            const pillar = getPillar(post.pillar)
            const format = FORMATS.find(f => f.id === post.format)
            const status = post.status || 'draft'
            const isStatusLoading = statusLoading[postId]

            return (
              <div key={postId} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card header */}
                <div
                  className="px-4 py-3 cursor-pointer"
                  style={{ borderBottom: isExpanded ? `1px solid ${theme.border}` : 'none' }}
                  onClick={() => setExpandedId(isExpanded ? null : postId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <PillarBadge pillarId={post.pillar} />
                        {format && (
                          <span style={{ fontSize: '0.75rem', color: theme.muted }}>
                            {format.emoji} {format.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: theme.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.intent}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: theme.muted, marginTop: '2px' }}>
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor[status] }}>
                        {statusEmoji[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span style={{ color: theme.muted, fontSize: '0.9rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 py-3 fade-in">
                    {/* Status actions */}
                    <div className="flex gap-1.5 mb-3">
                      {['draft', 'ready', 'posted'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(post, s)}
                          disabled={isStatusLoading}
                          className="flex-1 py-1.5 rounded-lg text-xs transition-all"
                          style={{
                            background: status === s ? `${statusColor[s]}20` : theme.creamDark,
                            color: status === s ? statusColor[s] : theme.muted,
                            border: `1px solid ${status === s ? statusColor[s] : theme.border}`,
                            fontWeight: status === s ? 600 : 400,
                            cursor: isStatusLoading ? 'not-allowed' : 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            opacity: isStatusLoading ? 0.6 : 1,
                          }}
                        >
                          {statusEmoji[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Quick copy buttons */}
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {post.result?.english?.caption_clean && (
                        <button
                          className="btn-ghost text-xs"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleCopy(post.result.english.caption_clean, `lib-en-${postId}`)}
                        >
                          {copied === `lib-en-${postId}` ? '✓ Copied!' : '🇬🇧 Copy EN'}
                        </button>
                      )}
                      {post.result?.hebrew?.caption_clean && (
                        <button
                          className="btn-ghost text-xs"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleCopy(post.result.hebrew.caption_clean, `lib-he-${postId}`)}
                        >
                          {copied === `lib-he-${postId}` ? '✓ Copied!' : '🇮🇱 Copy HE'}
                        </button>
                      )}
                      {post.result?.hooks?.length > 0 && (
                        <button
                          className="btn-ghost text-xs"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleCopy(post.result.hooks.join('\n\n'), `lib-hooks-${postId}`)}
                        >
                          {copied === `lib-hooks-${postId}` ? '✓ Copied!' : '🎣 Copy Hooks'}
                        </button>
                      )}
                    </div>

                    {/* Generated image */}
                    {post.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={post.imageUrl}
                          alt="Generated"
                          style={{
                            width: '100%',
                            maxWidth: '280px',
                            height: 'auto',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border}`,
                            display: 'block',
                            margin: '0 auto',
                          }}
                        />
                      </div>
                    )}

                    {/* Caption preview */}
                    {post.result?.english?.caption_clean && (
                      <div style={{
                        background: theme.cream,
                        borderRadius: '8px',
                        padding: '0.625rem',
                        border: `1px solid ${theme.border}`,
                        fontSize: '0.85rem',
                        color: theme.mid,
                        lineHeight: 1.6,
                        maxHeight: '120px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        {post.result.english.caption_clean}
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: '40px', background: 'linear-gradient(transparent, #FAF7F2)',
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
