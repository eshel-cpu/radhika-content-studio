import { useState } from 'react'
import { apiFetch } from '../api.js'
import { PILLARS, FORMATS, theme } from '../theme.js'
import PillarBadge from '../components/PillarBadge.jsx'

const MODES = [
  { id: 'autopilot', label: 'Autopilot', emoji: '🤖', desc: 'AI writes everything' },
  { id: 'collab',    label: 'Collab',    emoji: '🤝', desc: 'AI drafts, you refine' },
  { id: 'manual',    label: 'Enhance',   emoji: '✏️', desc: 'You write, AI improves' },
]

const PERCEPTION_COLORS = {
  Feeling: '#C4724A',
  Fact: '#2D6A4F',
  Fun: '#C9972C',
  Values: '#6B5B45',
  Imagination: '#40916C',
  Action: '#2C2416',
}

export default function CreatePage({ active, onGoToLibrary }) {
  // ── Step 1: inputs
  const [pillar, setPillar] = useState('')
  const [format, setFormat] = useState('')
  const [intent, setIntent] = useState('')
  const [mode, setMode] = useState('autopilot')
  const [draft, setDraft] = useState('')

  // ── Step 2: result
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Result view tab
  const [resultTab, setResultTab] = useState('english')

  // ── Copied state
  const [copied, setCopied] = useState('')

  async function handleGenerate() {
    if (!pillar || !format || !intent.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await apiFetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({ pillar, format, intent, mode, draft: mode === 'manual' ? draft : undefined }),
      })
      if (!res) return
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Generation failed')
        return
      }
      const data = await res.json()
      setResult(data)
      setResultTab('english')
    } catch (e) {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  function handleSaveToLibrary() {
    if (!result) return
    const post = {
      id: Date.now().toString(),
      pillar,
      format,
      intent,
      result,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('radhikaLibrary') || '[]')
    localStorage.setItem('radhikaLibrary', JSON.stringify([post, ...existing]))
    // Flash confirmation
    setCopied('saved')
    setTimeout(() => setCopied(''), 2000)
  }

  function handleReset() {
    setResult(null)
    setIntent('')
    setDraft('')
    setError('')
  }

  const canGenerate = pillar && format && intent.trim().length > 2

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">

      {/* Page title */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}
        >
          ✨ Create Post
        </h1>
        <p style={{ color: theme.mid, fontSize: '0.9rem' }}>
          Tell the AI what you want — it handles the rest.
        </p>
      </div>

      {!result ? (
        /* ── STEP 1: Input form ─────────────────────────────── */
        <div className="fade-in">

          {/* Pillar selector */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-3" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1 · Content Pillar
            </h2>
            <div className="flex flex-wrap gap-2">
              {PILLARS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPillar(p.id)}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: pillar === p.id ? p.bgColor : 'transparent',
                    color: pillar === p.id ? p.color : theme.mid,
                    border: `1.5px solid ${pillar === p.id ? p.color : theme.border}`,
                    fontWeight: pillar === p.id ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  title={p.description}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Format selector */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-3" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2 · Format
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="py-3 rounded-lg text-sm transition-all text-center"
                  style={{
                    background: format === f.id ? theme.greenPale : 'transparent',
                    color: format === f.id ? theme.green : theme.mid,
                    border: `1.5px solid ${format === f.id ? theme.green : theme.border}`,
                    fontWeight: format === f.id ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{f.emoji}</div>
                  <div>{f.label}</div>
                  <div style={{ fontSize: '0.7rem', color: theme.muted }}>{f.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Mode toggle */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-3" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3 · Mode
            </h2>
            <div className="flex gap-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm transition-all text-center"
                  style={{
                    background: mode === m.id ? theme.goldPale : 'transparent',
                    color: mode === m.id ? '#8B6914' : theme.mid,
                    border: `1.5px solid ${mode === m.id ? theme.gold : theme.border}`,
                    fontWeight: mode === m.id ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <div>{m.emoji} {m.label}</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '1px', opacity: 0.8 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Intent */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-2" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              4 · What's this post about?
            </h2>
            <p className="text-sm mb-3" style={{ color: theme.muted }}>
              One sentence is enough. The AI handles the rest.
            </p>
            <textarea
              value={intent}
              onChange={e => setIntent(e.target.value)}
              placeholder={
                mode === 'manual'
                  ? 'Paste your draft here — the AI will improve it...'
                  : 'e.g. "A quote from the Gita about detachment from results" or "Recap of last Friday\'s kirtan gathering"'
              }
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1.5px solid ${theme.border}`,
                fontSize: '0.95rem',
                fontFamily: 'DM Sans, sans-serif',
                color: theme.dark,
                background: theme.cream,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = theme.green)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
            />

            {/* Separate draft field for Enhance mode */}
            {mode === 'manual' && (
              <>
                <p className="text-sm mt-3 mb-2" style={{ color: theme.mid }}>
                  Additional context or specific instructions for the AI:
                </p>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="e.g. Keep the tone spiritual but not preachy. Use the hook: What if peace was a skill, not a gift?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1.5px solid ${theme.border}`,
                    fontSize: '0.9rem',
                    fontFamily: 'DM Sans, sans-serif',
                    color: theme.dark,
                    background: theme.cream,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  onFocus={e => (e.target.style.borderColor = theme.green)}
                  onBlur={e => (e.target.style.borderColor = theme.border)}
                />
              </>
            )}
          </section>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: theme.terraPale, color: theme.terra, border: `1px solid ${theme.terra}` }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="btn-gold w-full text-base py-3"
            style={{ width: '100%', fontSize: '1rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
          >
            {loading ? (
              <span>✨ Generating your post...</span>
            ) : (
              <span>Generate Post →</span>
            )}
          </button>

          {!canGenerate && (
            <p className="text-center mt-2 text-sm" style={{ color: theme.muted }}>
              Select pillar + format + write your intent to generate
            </p>
          )}

          {/* Loading shimmer */}
          {loading && (
            <div className="mt-4 space-y-3 fade-in">
              <div className="shimmer h-4 rounded" style={{ width: '80%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '60%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '70%' }} />
            </div>
          )}
        </div>
      ) : (
        /* ── STEP 2: Results ────────────────────────────────── */
        <div className="slide-up">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PillarBadge pillarId={pillar} />
              <span
                style={{
                  background: theme.greenPale,
                  color: theme.green,
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {FORMATS.find(f => f.id === format)?.emoji} {FORMATS.find(f => f.id === format)?.label}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="btn-ghost text-sm"
                style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}
              >
                {copied === 'saved' ? '✓ Saved!' : '📚 Save'}
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost text-sm"
                style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}
              >
                ← New post
              </button>
            </div>
          </div>

          {/* Result tab bar */}
          <div
            className="flex gap-1 mb-4 p-1 rounded-xl"
            style={{ background: theme.creamDark }}
          >
            {[
              { id: 'english',  label: '🇬🇧 English' },
              { id: 'hebrew',   label: '🇮🇱 Hebrew' },
              { id: 'hooks',    label: `🎣 Hooks (${result.hooks?.length || 5})` },
              { id: 'details',  label: '📋 Details' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setResultTab(tab.id)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: resultTab === tab.id ? 'white' : 'transparent',
                  color: resultTab === tab.id ? theme.dark : theme.mid,
                  fontWeight: resultTab === tab.id ? 600 : 400,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: resultTab === tab.id ? '0 1px 4px rgba(44,36,22,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── English caption ── */}
          {resultTab === 'english' && (
            <div className="card fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: theme.dark }}>English Caption</h3>
                <button
                  className="btn-ghost text-sm"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopy(result.english?.caption || '', 'en')}
                >
                  {copied === 'en' ? '✓ Copied!' : '📋 Copy all'}
                </button>
              </div>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.95rem',
                  color: theme.dark,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {result.english?.caption || result.raw}
              </pre>
              {result.english?.caption_clean && (
                <>
                  <div style={{ borderTop: `1px solid ${theme.border}`, margin: '1rem 0' }} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: theme.muted }}>Caption only (no hashtags)</span>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleCopy(result.english.caption_clean, 'en-clean')}
                    >
                      {copied === 'en-clean' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ color: theme.mid, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {result.english.caption_clean}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Hebrew caption ── */}
          {resultTab === 'hebrew' && (
            <div className="card fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: theme.dark }}>Hebrew Caption</h3>
                <button
                  className="btn-ghost text-sm"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopy(result.hebrew?.caption || '', 'he')}
                >
                  {copied === 'he' ? '✓ Copied!' : '📋 Copy all'}
                </button>
              </div>
              <pre
                className="rtl"
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'DM Sans, Arial Hebrew, sans-serif',
                  fontSize: '1rem',
                  color: theme.dark,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {result.hebrew?.caption}
              </pre>
              {result.hebrew?.caption_clean && (
                <>
                  <div style={{ borderTop: `1px solid ${theme.border}`, margin: '1rem 0' }} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: theme.muted }}>ללא הטאגים</span>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleCopy(result.hebrew.caption_clean, 'he-clean')}
                    >
                      {copied === 'he-clean' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <p className="rtl" style={{ color: theme.mid, fontSize: '0.95rem', lineHeight: 1.7 }}>
                    {result.hebrew.caption_clean}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Hooks ── */}
          {resultTab === 'hooks' && (
            <div className="fade-in space-y-3">
              <p className="text-sm mb-3" style={{ color: theme.mid }}>
                5 different opening hooks — each uses a different approach. Pick the one that feels right, or test multiple.
              </p>
              {(result.hooks || []).map((hook, i) => {
                const styles = [
                  { label: 'Curiosity Gap', color: theme.green },
                  { label: 'Pattern Interrupt', color: theme.terra },
                  { label: 'Bold Claim', color: theme.gold },
                  { label: 'Relatable Problem', color: theme.mid },
                  { label: 'Perspective Shift', color: theme.greenLight },
                ]
                const s = styles[i] || styles[0]
                return (
                  <div key={i} className="card" style={{ padding: '1rem' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        style={{
                          background: `${s.color}20`,
                          color: s.color,
                          borderRadius: '999px',
                          padding: '1px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        #{i + 1} {s.label}
                      </span>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleCopy(hook, `hook-${i}`)}
                      >
                        {copied === `hook-${i}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                    <p style={{ color: theme.dark, fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                      {hook}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Details (hashtags, visual, perception styles) ── */}
          {resultTab === 'details' && (
            <div className="fade-in space-y-4">

              {/* Hashtags */}
              {result.hashtags && (
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm" style={{ color: theme.dark }}>Hashtags</h3>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleCopy(result.hashtags, 'hashtags')}
                    >
                      {copied === 'hashtags' ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ color: theme.green, fontSize: '0.85rem', lineHeight: 1.8, wordBreak: 'break-word' }}>
                    {result.hashtags}
                  </p>
                </div>
              )}

              {/* Perception styles */}
              {result.perception_styles?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: theme.dark }}>
                    Perception Styles Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Feeling', 'Fact', 'Fun', 'Values', 'Imagination', 'Action'].map(style => {
                      const active = result.perception_styles.includes(style)
                      const color = PERCEPTION_COLORS[style]
                      return (
                        <span
                          key={style}
                          style={{
                            background: active ? `${color}20` : theme.creamDark,
                            color: active ? color : theme.muted,
                            border: `1.5px solid ${active ? color : theme.border}`,
                            borderRadius: '999px',
                            padding: '3px 10px',
                            fontSize: '0.8rem',
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {active ? '✓ ' : ''}{style}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-xs mt-2" style={{ color: theme.muted }}>
                    Aim to hit at least 2–3 styles for broader reach
                  </p>
                </div>
              )}

              {/* Visual direction */}
              {result.visual_direction && (
                <div className="card">
                  <h3 className="font-semibold text-sm mb-2" style={{ color: theme.dark }}>
                    🎬 Visual Direction
                  </h3>
                  <p style={{ color: theme.mid, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {result.visual_direction}
                  </p>
                </div>
              )}

              {/* Comment trigger */}
              {result.comment_trigger && (
                <div
                  className="card"
                  style={{ background: theme.goldPale, border: `1px solid ${theme.gold}` }}
                >
                  <h3 className="font-semibold text-sm mb-2" style={{ color: '#8B6914' }}>
                    💬 Comment-Trigger Mechanic
                  </h3>
                  <p style={{ color: '#8B6914', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {result.comment_trigger}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#a07820' }}>
                    Set up ManyChat or manual DM reply to deliver the resource when someone comments
                  </p>
                </div>
              )}

              {/* Posting tip */}
              {result.posting_tip && (
                <div className="card">
                  <h3 className="font-semibold text-sm mb-2" style={{ color: theme.dark }}>
                    📌 Posting Tip
                  </h3>
                  <p style={{ color: theme.mid, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {result.posting_tip}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveToLibrary}
              className="btn-green flex-1"
            >
              {copied === 'saved' ? '✓ Saved to Library!' : '📚 Save to Library'}
            </button>
            <button onClick={handleReset} className="btn-ghost flex-1">
              ← New Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
