/**
 * ImageGenerator.jsx
 *
 * Two image generation options shown after a post is created:
 * A) Canvas Tile — instant, free, branded (browser-side rendering)
 * B) AI Image — Ideogram (quote tiles) or fal.ai FLUX (scenes)
 */

import { useState, useRef } from 'react'
import { apiFetch } from '../api.js'
import { theme, getPillar } from '../theme.js'

// ─── CANVAS TILE (Option A — free, instant) ────────────────────────────────────

function drawCanvasTile({ canvas, quote, attribution, pillarId }) {
  const ctx = canvas.getContext('2d')
  const size = 1080
  canvas.width = size
  canvas.height = size

  const pillar = getPillar(pillarId)

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  if (pillarId === 'wisdom') {
    grad.addColorStop(0, '#1a3d2b')
    grad.addColorStop(1, '#2D6A4F')
  } else if (pillarId === 'community') {
    grad.addColorStop(0, '#8B4A2E')
    grad.addColorStop(1, '#C4724A')
  } else if (pillarId === 'explain') {
    grad.addColorStop(0, '#8B6914')
    grad.addColorStop(1, '#C9972C')
  } else {
    grad.addColorStop(0, '#3d2e1a')
    grad.addColorStop(1, '#6B5B45')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // Subtle texture overlay — concentric circles
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let r = 100; r < size * 1.2; r += 80) {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Top accent line
  ctx.fillStyle = 'rgba(201,151,44,0.6)'
  ctx.fillRect(size * 0.1, 80, size * 0.8, 2)

  // Radhika brand mark (top)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '500 32px DM Sans, sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '6px'
  ctx.fillText('RADHIKA', size / 2, 140)

  // Quote text — wrapped
  const maxWidth = size * 0.78
  const lineHeight = 88
  const quoteToRender = quote.length > 200 ? quote.slice(0, 200) + '…' : quote

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = `italic 700 ${quoteToRender.length > 100 ? 56 : 68}px Georgia, serif`
  ctx.textAlign = 'center'

  // Opening quote mark
  ctx.fillStyle = 'rgba(201,151,44,0.7)'
  ctx.font = 'italic 140px Georgia, serif'
  ctx.fillText('\u201C', size * 0.12, size * 0.42)

  // Wrap and draw quote
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  const fontSize = quoteToRender.length > 100 ? 52 : 62
  ctx.font = `italic 700 ${fontSize}px Georgia, serif`

  const words = quoteToRender.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)

  const totalHeight = lines.length * lineHeight
  let y = size / 2 - totalHeight / 2 + 40
  for (const line of lines) {
    ctx.fillText(line, size / 2, y)
    y += lineHeight
  }

  // Attribution
  if (attribution) {
    ctx.fillStyle = 'rgba(201,151,44,0.85)'
    ctx.font = '500 34px DM Sans, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`— ${attribution}`, size / 2, y + 60)
  }

  // Bottom accent line
  ctx.fillStyle = 'rgba(201,151,44,0.6)'
  ctx.fillRect(size * 0.1, size - 82, size * 0.8, 2)

  // Bottom tagline
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '400 26px DM Sans, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('bhakti yoga · Israel', size / 2, size - 48)
}

function CanvasTileGenerator({ caption, pillarId }) {
  const canvasRef = useRef(null)
  const [quote, setQuote] = useState(
    caption?.split('\n')?.[0]?.replace(/^["']/, '').replace(/["']$/, '') || ''
  )
  const [attribution, setAttribution] = useState('Bhagavad Gita')
  const [rendered, setRendered] = useState(false)

  function handleRender() {
    const canvas = canvasRef.current
    drawCanvasTile({ canvas, quote, attribution, pillarId })
    setRendered(true)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `radhika-tile-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div>
      <div className="space-y-3 mb-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: theme.mid }}>
            Quote text
          </label>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            rows={3}
            style={{
              width: '100%', padding: '0.625rem', borderRadius: '8px',
              border: `1.5px solid ${theme.border}`, fontSize: '0.85rem',
              fontFamily: 'DM Sans, sans-serif', color: theme.dark,
              background: theme.cream, outline: 'none', resize: 'vertical',
            }}
            onFocus={e => (e.target.style.borderColor = theme.green)}
            onBlur={e => (e.target.style.borderColor = theme.border)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: theme.mid }}>
            Attribution
          </label>
          <input
            value={attribution}
            onChange={e => setAttribution(e.target.value)}
            placeholder="e.g. Bhagavad Gita 2.47 / Hridayananda Das Goswami"
            style={{
              width: '100%', padding: '0.625rem', borderRadius: '8px',
              border: `1.5px solid ${theme.border}`, fontSize: '0.85rem',
              fontFamily: 'DM Sans, sans-serif', color: theme.dark,
              background: theme.cream, outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = theme.green)}
            onBlur={e => (e.target.style.borderColor = theme.border)}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={handleRender} className="btn-green flex-1">
          🎨 Render Tile
        </button>
        {rendered && (
          <button onClick={handleDownload} className="btn-gold flex-1">
            ⬇ Download PNG
          </button>
        )}
      </div>

      {/* Hidden canvas — renders at 1080x1080, shown at 320px */}
      <canvas
        ref={canvasRef}
        style={{
          display: rendered ? 'block' : 'none',
          width: '100%',
          maxWidth: '320px',
          height: 'auto',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          margin: '0 auto',
        }}
      />
    </div>
  )
}

// ─── AI IMAGE GENERATOR (Option B — Ideogram / fal.ai) ────────────────────────

function AIImageGenerator({ visualDirection, pillarId, format, englishCaption }) {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState('')
  const [provider, setProvider] = useState(null)

  const isQuoteTile = format === 'quote-tile' || format === 'single-image'

  async function handleGenerate() {
    if (!visualDirection) return
    setLoading(true)
    setError('')
    setImageUrl(null)

    try {
      // Extract first line of caption as potential quote
      const quote = englishCaption?.split('\n')?.[0]?.slice(0, 120) || ''

      const res = await apiFetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          type: isQuoteTile ? 'tile' : 'scene',
          visualDirection,
          pillar: pillarId,
          quote,
        }),
      })
      if (!res) return
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Image generation failed')
        return
      }
      const data = await res.json()
      setImageUrl(data.url)
      setProvider(data.provider)
    } catch (e) {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `radhika-${format}-${Date.now()}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          style={{
            background: isQuoteTile ? theme.goldPale : theme.greenPale,
            color: isQuoteTile ? '#8B6914' : theme.green,
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {isQuoteTile ? '🎨 Ideogram v2' : '⚡ fal.ai FLUX Pro'}
        </div>
        <span style={{ fontSize: '0.75rem', color: theme.muted }}>
          {isQuoteTile ? '~$0.03 · best text rendering' : '~$0.006 · photorealistic scenes'}
        </span>
      </div>

      {!imageUrl && (
        <button
          onClick={handleGenerate}
          disabled={loading || !visualDirection}
          className="btn-gold w-full"
          style={{ width: '100%' }}
        >
          {loading
            ? `✨ Generating${isQuoteTile ? ' with Ideogram' : ' with FLUX'}... (15–30s)`
            : `Generate ${isQuoteTile ? 'Quote Tile' : 'Scene Image'} →`}
        </button>
      )}

      {loading && (
        <div className="mt-3 space-y-2">
          <div className="shimmer h-3 rounded" style={{ width: '70%' }} />
          <div className="shimmer h-3 rounded" style={{ width: '50%' }} />
          <p className="text-xs mt-2" style={{ color: theme.muted }}>
            {isQuoteTile ? 'Ideogram is rendering your tile with text...' : 'FLUX is generating your scene image...'}
          </p>
        </div>
      )}

      {error && (
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{ background: theme.terraPale, color: theme.terra }}
        >
          ⚠️ {error}
          {error.includes('API_KEY') && (
            <p className="text-xs mt-1">
              Add {error.includes('IDEOGRAM') ? 'IDEOGRAM_API_KEY' : 'FAL_API_KEY'} to Railway env vars.
            </p>
          )}
        </div>
      )}

      {imageUrl && (
        <div className="mt-3 fade-in">
          <img
            src={imageUrl}
            alt="Generated"
            style={{
              width: '100%',
              maxWidth: '320px',
              height: 'auto',
              borderRadius: '10px',
              border: `1px solid ${theme.border}`,
              display: 'block',
              margin: '0 auto 12px',
            }}
          />
          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn-gold flex-1">
              ⬇ Download
            </button>
            <button
              onClick={() => setImageUrl(null)}
              className="btn-ghost flex-1"
              style={{ fontSize: '0.85rem' }}
            >
              🔄 Regenerate
            </button>
          </div>
          {provider && (
            <p className="text-xs text-center mt-2" style={{ color: theme.muted }}>
              Generated by {provider}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN EXPORT — Tabbed wrapper ──────────────────────────────────────────────

export default function ImageGenerator({ result, pillarId, format }) {
  const [tab, setTab] = useState('canvas')

  const visualDirection = result?.visual_direction || ''
  const englishCaption = result?.english?.caption_clean || result?.english?.caption || ''

  if (!visualDirection) return null

  const isQuoteTile = format === 'quote-tile' || format === 'single-image'

  return (
    <div className="card mt-4">
      <h3 className="font-semibold mb-1" style={{ color: theme.dark }}>
        🖼 Generate Image
      </h3>
      <p className="text-xs mb-3" style={{ color: theme.muted }}>
        Visual direction: <em>{visualDirection.slice(0, 100)}{visualDirection.length > 100 ? '…' : ''}</em>
      </p>

      {/* Tab selector */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-xl"
        style={{ background: theme.creamDark }}
      >
        {[
          { id: 'canvas', label: '🎨 Canvas Tile', sub: 'Free · Instant · Branded' },
          { id: 'ai',     label: '🤖 AI Generated', sub: isQuoteTile ? 'Ideogram v2' : 'FLUX Pro' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-sm transition-all text-center"
            style={{
              background: tab === t.id ? 'white' : 'transparent',
              color: tab === t.id ? theme.dark : theme.mid,
              fontWeight: tab === t.id ? 600 : 400,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: tab === t.id ? '0 1px 4px rgba(44,36,22,0.1)' : 'none',
            }}
          >
            <div>{t.label}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {tab === 'canvas' && (
        <CanvasTileGenerator
          caption={englishCaption}
          pillarId={pillarId}
        />
      )}

      {tab === 'ai' && (
        <AIImageGenerator
          visualDirection={visualDirection}
          pillarId={pillarId}
          format={format}
          englishCaption={englishCaption}
        />
      )}
    </div>
  )
}
