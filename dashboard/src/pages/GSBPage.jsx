import { useState } from 'react'
import { apiFetch } from '../api.js'
import { theme } from '../theme.js'

export default function GSBPage({ active }) {
  const [goldPosts, setGoldPosts] = useState('')
  const [silverPosts, setSilverPosts] = useState('')
  const [bronzePosts, setBronzePosts] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    const gold = goldPosts.trim().split('\n').filter(Boolean)
    const silver = silverPosts.trim().split('\n').filter(Boolean)
    const bronze = bronzePosts.trim().split('\n').filter(Boolean)

    if (gold.length === 0 || silver.length === 0 || bronze.length === 0) {
      setError('Enter at least 1 post in each tier')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await apiFetch('/api/gsb', {
        method: 'POST',
        body: JSON.stringify({ goldPosts: gold, silverPosts: silver, bronzePosts: bronze }),
      })
      if (!res) return
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Analysis failed')
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

  function handleReset() {
    setResult(null)
    setGoldPosts('')
    setSilverPosts('')
    setBronzePosts('')
    setError('')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: `1.5px solid ${theme.border}`,
    fontSize: '0.85rem',
    fontFamily: 'DM Sans, sans-serif',
    color: theme.dark,
    background: theme.cream,
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: theme.dark }}>
          📊 GSB Analysis
        </h1>
        <p style={{ color: theme.mid, fontSize: '0.9rem' }}>
          Brendan Kane's Gold-Silver-Bronze: find what your top posts have that your bottom posts don't.
        </p>
      </div>

      {/* How it works */}
      {!result && (
        <div className="card mb-4" style={{ background: theme.goldPale, border: `1px solid ${theme.gold}` }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: '#8B6914' }}>
            🏆 How GSB works
          </h3>
          <ol className="space-y-1 text-sm" style={{ color: '#8B6914', paddingLeft: '1.25rem', listStyle: 'decimal' }}>
            <li><strong>Gold</strong> — your 3–5 best performing posts (most views, likes, comments, shares)</li>
            <li><strong>Silver</strong> — your middle performers (average results)</li>
            <li><strong>Bronze</strong> — your worst performing posts</li>
            <li>AI identifies what's EXCLUSIVE to gold — that's your content formula</li>
          </ol>
          <p className="text-xs mt-2" style={{ color: '#a07820' }}>
            Works with any data: paste captions, describe posts, or write what the post was about. One line per post.
          </p>
        </div>
      )}

      {!result ? (
        <div className="fade-in">
          {/* Three tiers */}
          {[
            { key: 'gold', label: '🥇 Gold Posts', subtitle: 'Best performers', value: goldPosts, setter: setGoldPosts, bg: '#FFF9E6', border: theme.gold, color: '#8B6914' },
            { key: 'silver', label: '🥈 Silver Posts', subtitle: 'Mid performers', value: silverPosts, setter: setSilverPosts, bg: theme.creamDark, border: theme.border, color: theme.mid },
            { key: 'bronze', label: '🥉 Bronze Posts', subtitle: 'Lowest performers', value: bronzePosts, setter: setBronzePosts, bg: theme.terraPale, border: theme.terra, color: theme.terra },
          ].map(tier => (
            <div key={tier.key} className="card mb-4" style={{ background: tier.bg, border: `1.5px solid ${tier.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold" style={{ color: tier.color }}>{tier.label}</h2>
                <span className="text-xs" style={{ color: tier.color, opacity: 0.7 }}>{tier.subtitle}</span>
              </div>
              <textarea
                value={tier.value}
                onChange={e => tier.setter(e.target.value)}
                placeholder={`Paste or describe your ${tier.key} posts here...\nOne post per line.\n\nExample:\n"What if peace was a skill, not a gift?" — Gita class recap with 1.2K views\nKirtan video — 3-min reel with 800 views and 45 comments`}
                rows={4}
                style={{ ...inputStyle, background: 'white', borderColor: tier.border }}
                onFocus={e => (e.target.style.borderColor = tier.border)}
                onBlur={e => (e.target.style.borderColor = tier.border)}
              />
            </div>
          ))}

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: theme.terraPale, color: theme.terra }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || (!goldPosts.trim() || !silverPosts.trim() || !bronzePosts.trim())}
            className="btn-gold w-full"
            style={{ width: '100%', fontSize: '1rem', padding: '0.875rem' }}
          >
            {loading ? '📊 Analyzing...' : 'Run GSB Analysis →'}
          </button>

          {loading && (
            <div className="mt-4 space-y-3">
              <div className="shimmer h-4 rounded" style={{ width: '85%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '65%' }} />
              <div className="shimmer h-4 rounded" style={{ width: '75%' }} />
            </div>
          )}
        </div>
      ) : (
        /* Results */
        <div className="slide-up">
          {/* Reset button */}
          <div className="flex justify-end mb-4">
            <button onClick={handleReset} className="btn-ghost text-sm" style={{ padding: '0.375rem 0.875rem' }}>
              ← Run new analysis
            </button>
          </div>

          {/* Key insight */}
          {result.key_insight && (
            <div
              className="card mb-4"
              style={{ background: theme.greenPale, border: `1.5px solid ${theme.green}` }}
            >
              <h3 className="font-semibold mb-1" style={{ color: theme.green }}>💡 Key Insight</h3>
              <p style={{ color: theme.dark, fontSize: '0.95rem', lineHeight: 1.6 }}>{result.key_insight}</p>
            </div>
          )}

          {/* Gold patterns */}
          {result.gold_patterns?.length > 0 && (
            <div className="card mb-4">
              <h3 className="font-semibold mb-3" style={{ color: theme.dark }}>🥇 What Gold Posts Have</h3>
              <ul className="space-y-2">
                {result.gold_patterns.map((p, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: '0.9rem', color: theme.mid }}>
                    <span style={{ color: theme.gold, flexShrink: 0 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bronze mistakes */}
          {result.bronze_mistakes?.length > 0 && (
            <div className="card mb-4">
              <h3 className="font-semibold mb-3" style={{ color: theme.dark }}>🥉 What Bronze Posts Get Wrong</h3>
              <ul className="space-y-2">
                {result.bronze_mistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: '0.9rem', color: theme.mid }}>
                    <span style={{ color: theme.terra, flexShrink: 0 }}>✗</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hook + perception analysis */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {result.hook_analysis && (
              <div className="card">
                <h3 className="font-semibold text-sm mb-2" style={{ color: theme.dark }}>🎣 Hook Patterns</h3>
                <p style={{ fontSize: '0.9rem', color: theme.mid, lineHeight: 1.6 }}>{result.hook_analysis}</p>
              </div>
            )}
            {result.perception_style_gap && (
              <div className="card">
                <h3 className="font-semibold text-sm mb-2" style={{ color: theme.dark }}>👁 Perception Style Gap</h3>
                <p style={{ fontSize: '0.9rem', color: theme.mid, lineHeight: 1.6 }}>{result.perception_style_gap}</p>
              </div>
            )}
          </div>

          {/* Format to avoid */}
          {result.format_to_avoid && (
            <div className="card mb-4" style={{ background: theme.terraPale, border: `1px solid ${theme.terra}` }}>
              <h3 className="font-semibold text-sm mb-1" style={{ color: theme.terra }}>🚫 Stop Doing This</h3>
              <p style={{ fontSize: '0.9rem', color: theme.terra, lineHeight: 1.6 }}>{result.format_to_avoid}</p>
            </div>
          )}

          {/* Content brief */}
          {result.content_brief && (
            <div className="card">
              <h3
                className="font-semibold mb-1"
                style={{ fontFamily: 'Playfair Display, serif', color: theme.dark, fontSize: '1.1rem' }}
              >
                📋 {result.content_brief.headline || 'Your Next 2 Weeks'}
              </h3>
              <p className="text-sm mb-4" style={{ color: theme.muted }}>
                Based on your GSB analysis — what to create next
              </p>
              {result.content_brief.posts?.length > 0 && (
                <div className="space-y-3">
                  {result.content_brief.posts.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        background: theme.cream,
                        borderRadius: '8px',
                        padding: '0.75rem',
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          style={{
                            background: theme.greenPale,
                            color: theme.green,
                            borderRadius: '999px',
                            padding: '1px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {p.pillar}
                        </span>
                        <span
                          style={{
                            background: theme.goldPale,
                            color: '#8B6914',
                            borderRadius: '999px',
                            padding: '1px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {p.format}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: theme.dark, fontWeight: 500 }}>{p.angle}</p>
                      {p.hook_direction && (
                        <p className="text-xs mt-1" style={{ color: theme.muted }}>Hook direction: {p.hook_direction}</p>
                      )}
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
