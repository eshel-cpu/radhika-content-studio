import { useState } from 'react'
import { apiFetch } from '../api.js'
import { theme, SOURCE_TYPES } from '../theme.js'

export default function WaterfallPage({ active, onGoToLibrary }) {
  const [sourceType, setSourceType] = useState('class')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [openSections, setOpenSections] = useState({ reels: true, quote_tiles: true, stories: true, captions: true })

  async function handleGenerate() {
    if (!transcript.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await apiFetch('/api/waterfall', {
        method: 'POST',
        body: JSON.stringify({ transcript, sourceType }),
      })
      if (!res) return
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Generation failed')
        return
      }
      const data = await res.json()
      setResult(data)
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

  function saveItem(item, type) {
    const post = {
      id: Date.now().toString() + Math.random(),
      pillar: 'community',
      format: type === 'reels' ? 'reel' : type === 'quote_tiles' ? 'quote-tile' : 'single-image',
      intent: item.clip_description || item.quote || item.hook || 'From waterfall',
      result: {
        english: { caption: item.english_caption || item.english || '' },
        hebrew: { caption: item.hebrew_caption || item.hebrew || '' },
        hooks: [],
        visual_direction: item.visual_note || '',
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('radhikaLibrary') || '[]')
    localStorage.setItem('radhikaLibrary', JSON.stringify([post, ...existing]))
    setCopied(`saved-${type}-${item.quote || item.clip_description}`)
    setTimeout(() => setCopied(''), 2000)
  }

  function toggleSection(key) {
    setOpenSections(s => ({ ...s, [key]: !s[key] }))
  }

  const totalPieces = result
    ? (result.reels?.length || 0) + (result.quote_tiles?.length || 0) +
      (result.stories?.length || 0) + (result.captions?.length || 0)
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
          🌊 Content Waterfall
        </h1>
        <p style={{ color: theme.mid, fontSize: '0.9rem' }}>
          Describe one recording → get 5–10 pieces of content automatically.
        </p>
      </div>

      {!result ? (
        <div className="fade-in">
          {/* How it works */}
          <div
            className="card mb-4"
            style={{ background: theme.goldPale, border: `1px solid ${theme.gold}` }}
          >
            <h3 className="font-semibold text-sm mb-2" style={{ color: '#8B6914' }}>
              ⚡ How it works
            </h3>
            <ol className="space-y-1 text-sm" style={{ color: '#8B6914', paddingLeft: '1.25rem', listStyle: 'decimal' }}>
              <li>Describe your recording (or paste a transcript)</li>
              <li>AI breaks it into Reels, quote tiles, story ideas, and standalone captions</li>
              <li>Run the clips through <strong>OpusClip</strong> for auto-editing</li>
              <li>Save each piece to your Library and schedule</li>
            </ol>
          </div>

          {/* Source type */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-3" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1 · Source Type
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SOURCE_TYPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSourceType(s.id)}
                  className="py-3 rounded-lg text-sm text-center transition-all"
                  style={{
                    background: sourceType === s.id ? theme.greenPale : 'transparent',
                    color: sourceType === s.id ? theme.green : theme.mid,
                    border: `1.5px solid ${sourceType === s.id ? theme.green : theme.border}`,
                    fontWeight: sourceType === s.id ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{s.emoji}</div>
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Transcript */}
          <section className="card mb-4">
            <h2 className="text-sm font-semibold mb-2" style={{ color: theme.mid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2 · Describe or Paste Transcript
            </h2>
            <p className="text-sm mb-3" style={{ color: theme.muted }}>
              Even a rough summary works. The more detail you give, the better the content plan.
            </p>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder={`Describe what happened in your ${sourceType}...\n\nExample: "30-minute kirtan with Maharaj Das leading. We sang Hare Krishna for 20 minutes, then a short talk about the meaning of the maha-mantra. About 15 people attended, very warm energy. Ended with prasadam (rice and dal)."`}
              rows={8}
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
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = theme.green)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
            />
          </section>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: theme.terraPale, color: theme.terra }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!transcript.trim() || loading}
            className="btn-gold w-full"
            style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}
          >
            {loading ? '🌊 Generating content plan...' : 'Generate Content Plan →'}
          </button>

          {loading && (
            <div className="mt-4 space-y-3">
              <div className="shimmer h-4 rounded" style={{ width: '90%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '70%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '80%' }} />
            </div>
          )}
        </div>
      ) : (
        /* Results */
        <div className="slide-up">
          {/* Summary + reset */}
          <div className="card mb-4" style={{ background: theme.greenPale, border: `1px solid ${theme.green}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm" style={{ color: theme.green }}>
                  ✓ {totalPieces} content pieces generated
                </p>
                {result.summary && (
                  <p className="text-sm mt-1" style={{ color: theme.greenLight }}>{result.summary}</p>
                )}
              </div>
              <button
                onClick={() => { setResult(null); setTranscript('') }}
                className="btn-ghost text-sm"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                ← New
              </button>
            </div>
          </div>

          {/* OpusClip instructions */}
          {result.opusclip_note && (
            <div className="card mb-4" style={{ background: theme.goldPale, border: `1px solid ${theme.gold}` }}>
              <h3 className="font-semibold text-sm mb-1" style={{ color: '#8B6914' }}>
                ✂️ OpusClip Instructions
              </h3>
              <p className="text-sm" style={{ color: '#8B6914' }}>{result.opusclip_note}</p>
              <p className="text-xs mt-2" style={{ color: '#a07820' }}>
                Upload your video to opusclip.com → use these instructions to guide the AI clipping
              </p>
            </div>
          )}

          {/* Reels */}
          {result.reels?.length > 0 && (
            <div className="card mb-4">
              <button
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleSection('reels')}
              >
                <h3 className="font-semibold" style={{ color: theme.dark }}>
                  🎬 Reels ({result.reels.length})
                </h3>
                <span style={{ color: theme.muted }}>{openSections.reels ? '▲' : '▼'}</span>
              </button>
              {openSections.reels && (
                <div className="mt-3 space-y-3">
                  {result.reels.map((reel, i) => (
                    <div key={i} style={{ background: theme.cream, borderRadius: '8px', padding: '0.75rem', border: `1px solid ${theme.border}` }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium" style={{ color: theme.dark }}>{reel.clip_description}</p>
                        <span style={{ background: theme.greenPale, color: theme.green, borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                          {reel.duration_estimate}
                        </span>
                      </div>
                      {reel.hook && (
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: theme.muted }}>Hook: <span style={{ color: theme.terra }}>{reel.hook}</span></p>
                          <button className="btn-ghost" style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleCopy(reel.hook, `reel-hook-${i}`)}>
                            {copied === `reel-hook-${i}` ? '✓' : 'Copy'}
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(reel.english_caption, `reel-en-${i}`)}>
                          {copied === `reel-en-${i}` ? '✓' : '🇬🇧 Copy EN'}
                        </button>
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(reel.hebrew_caption, `reel-he-${i}`)}>
                          {copied === `reel-he-${i}` ? '✓' : '🇮🇱 Copy HE'}
                        </button>
                        <button className="btn-green flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => saveItem(reel, 'reels')}>
                          {copied?.startsWith('saved-reels') ? '✓ Saved' : '📚 Save'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quote Tiles */}
          {result.quote_tiles?.length > 0 && (
            <div className="card mb-4">
              <button
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleSection('quote_tiles')}
              >
                <h3 className="font-semibold" style={{ color: theme.dark }}>
                  ✨ Quote Tiles ({result.quote_tiles.length})
                </h3>
                <span style={{ color: theme.muted }}>{openSections.quote_tiles ? '▲' : '▼'}</span>
              </button>
              {openSections.quote_tiles && (
                <div className="mt-3 space-y-3">
                  {result.quote_tiles.map((qt, i) => (
                    <div key={i} style={{ background: theme.goldPale, borderRadius: '8px', padding: '0.75rem', border: `1px solid ${theme.border}` }}>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.dark, fontStyle: 'italic' }}>"{qt.quote}"</p>
                      <p className="text-xs mb-2" style={{ color: '#8B6914' }}>— {qt.attribution}</p>
                      {qt.visual_note && <p className="text-xs mb-2" style={{ color: theme.muted }}>Design: {qt.visual_note}</p>}
                      <div className="flex gap-2">
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(qt.english_caption, `qt-en-${i}`)}>
                          {copied === `qt-en-${i}` ? '✓' : '🇬🇧 Copy EN'}
                        </button>
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(qt.hebrew_caption, `qt-he-${i}`)}>
                          {copied === `qt-he-${i}` ? '✓' : '🇮🇱 Copy HE'}
                        </button>
                        <button className="btn-green flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => saveItem(qt, 'quote_tiles')}>
                          📚 Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stories */}
          {result.stories?.length > 0 && (
            <div className="card mb-4">
              <button
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleSection('stories')}
              >
                <h3 className="font-semibold" style={{ color: theme.dark }}>
                  📱 Story Ideas ({result.stories.length})
                </h3>
                <span style={{ color: theme.muted }}>{openSections.stories ? '▲' : '▼'}</span>
              </button>
              {openSections.stories && (
                <ul className="mt-3 space-y-2">
                  {result.stories.map((story, i) => (
                    <li key={i} style={{ background: theme.cream, borderRadius: '8px', padding: '0.625rem 0.75rem', border: `1px solid ${theme.border}`, fontSize: '0.9rem', color: theme.mid }}>
                      <div className="flex items-start justify-between gap-2">
                        <span>{story}</span>
                        <button className="btn-ghost" style={{ padding: '0.1rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }} onClick={() => handleCopy(story, `story-${i}`)}>
                          {copied === `story-${i}` ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Standalone captions */}
          {result.captions?.length > 0 && (
            <div className="card mb-4">
              <button
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleSection('captions')}
              >
                <h3 className="font-semibold" style={{ color: theme.dark }}>
                  📝 Standalone Captions ({result.captions.length})
                </h3>
                <span style={{ color: theme.muted }}>{openSections.captions ? '▲' : '▼'}</span>
              </button>
              {openSections.captions && (
                <div className="mt-3 space-y-3">
                  {result.captions.map((cap, i) => (
                    <div key={i} style={{ background: theme.cream, borderRadius: '8px', padding: '0.75rem', border: `1px solid ${theme.border}` }}>
                      {cap.hook && <p className="text-xs font-semibold mb-1" style={{ color: theme.terra }}>Hook: {cap.hook}</p>}
                      <div className="flex gap-2 mt-2">
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(cap.english, `cap-en-${i}`)}>
                          {copied === `cap-en-${i}` ? '✓' : '🇬🇧 Copy EN'}
                        </button>
                        <button className="btn-ghost flex-1 text-xs" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => handleCopy(cap.hebrew, `cap-he-${i}`)}>
                          {copied === `cap-he-${i}` ? '✓' : '🇮🇱 Copy HE'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
