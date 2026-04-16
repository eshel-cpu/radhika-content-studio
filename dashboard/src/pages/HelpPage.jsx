import { useState } from 'react'

const SECTIONS = [
  {
    id: 'overview',
    title: '🌸 What Is Radhika Content Studio?',
    content: `Radhika Content Studio is a custom AI-powered Instagram content creation tool built specifically for the Radhika bhakti community in Israel. Satya (community manager) uses it daily to create, plan, and archive Instagram content in both English and Hebrew.

Generic social media tools don't understand bhakti content. The Studio has Radhika's brand voice, content pillars, and ISKCON/Krishna West framing baked directly into Claude's system prompt. It also uses the Brendan Kane VCM framework (hooks, perception styles, comment-trigger CTAs) to maximize IG engagement for a spiritual community audience.`,
  },
  {
    id: 'tabs',
    title: '📄 The 5 Tabs',
    subsections: [
      {
        title: '✨ Create (C)',
        content: `Generate a single Instagram post.

1. Choose **Content Pillar** — Wisdom Drops / Community Life / Bhakti Explained / Personal Stories / Events
2. Choose **Format** — Reel / Carousel / Quote Tile / Single Image
3. Type your **intent** — what this post is about ("Sunday kirtan recap" / "Gita verse on detachment")
4. Pick a **Mode:**
   - 🤖 Autopilot — AI writes everything
   - 🤝 Collab — AI drafts, you refine with inline notes
   - ✏️ Enhance — you write the draft, AI sharpens it
5. Hit Generate → get: English caption, Hebrew caption, 5 hook variations, visual direction, posting tip

**Edit inline:** Both English and Hebrew captions are editable directly in the output panel — no need to regenerate to fix one word. Just click into the caption box and type.

**Save to Library:** Hit Save → post archived to Notion with status "Draft".`,
      },
      {
        title: '🎨 Generate Image (on output panel)',
        content: `Two image modes after generating a post:

- 🎨 **Canvas Tile** — instant, free, branded quote graphic for download (1080×1080 PNG). No API cost.
- 🤖 **AI Image** — Ideogram v2 for quote tiles, FLUX Pro for scene/reel covers (~$0.03/image). Better quality but has a cost.`,
      },
      {
        title: '📅 Calendar (K)',
        content: `View and plan your content schedule.

- Month view showing all saved posts by scheduled date
- Drag posts to different dates
- Post status visible: Draft → Ready → Posted
- **IG Grid Preview toggle:** Click "Grid Preview" to see how the last 9 posts look in your Instagram feed — 3×3 visual mockup with format emoji and pillar color.
- **Best Days toggle:** Click "Best Days" to overlay heatmap shading showing the best days to post for the Radhika audience (Israel timezone):
  - 🟢 Thursday & Monday — peak engagement
  - 🟡 Tuesday & Wednesday — good
  - ⬜ Sunday — average
  - 🔴 Saturday (Shabbat) — avoid`,
      },
      {
        title: '🌊 Waterfall (W)',
        content: `Turn one long transcript into multiple content pieces.

1. Paste a transcript (from a Varshabanavi class, talk, or event video)
2. Hit Generate → AI extracts 5–10 content pieces:
   - Reel hooks/scripts
   - Quote tiles
   - Story prompts
   - Caption ideas
   - Key verse callouts
3. Each piece shows a **Virality Score (⚡ 0–100)** — hover for the reason. Use it to prioritize which pieces to produce first.

Use this after every class recording or ISKCON event talk.`,
      },
      {
        title: '📚 Library (L)',
        content: `Browse all saved posts from Notion.

- Filter by status (Draft / Ready / Posted)
- Filter by pillar
- Copy captions in one click
- Update status as you post`,
      },
      {
        title: '📊 GSB — Gold/Silver/Bronze (G)',
        content: `Analyze what's working on the Instagram account.

1. Paste your **Gold posts** (top performers — most views/likes/comments)
2. Paste your **Silver posts** (mid-tier)
3. Paste your **Bronze posts** (worst performers)
4. Hit Analyze → get:
   - What gold posts do that bronze doesn't
   - Which content patterns to repeat
   - Which formats to avoid
   - A 2-week content brief with specific post angles

**Run GSB monthly** to recalibrate the content strategy.`,
      },
    ],
  },
  {
    id: 'pillars',
    title: '🕉️ Content Pillars',
    table: {
      headers: ['Pillar', 'What It Covers'],
      rows: [
        ['Wisdom Drops', 'Gita verses, Prabhupada quotes, philosophical insights — short and shareable'],
        ['Community Life', 'Behind-the-scenes, kirtan recaps, event photos, community moments'],
        ['Bhakti Explained', 'Accessible explainers — "What is bhakti?", devotional practices for beginners'],
        ['Personal Stories', 'Satya\'s personal practice, transformation stories, devotee journeys'],
        ['Events', 'Upcoming events, program announcements, retreat previews'],
      ],
    },
  },
  {
    id: 'workflow',
    title: '📋 Weekly Content Workflow',
    content: `**Recommended weekly routine:**

1. **Monday:** Run Waterfall on last week's class transcript → extract 5–10 pieces
2. **Tuesday–Wednesday:** Use Create tab to polish 3–4 pieces from Waterfall output
3. **Thursday:** Check Calendar heatmap → schedule best pieces for Thu/Mon posts
4. **Ongoing:** Update Library statuses as you post (Draft → Ready → Posted)
5. **Monthly:** Run GSB analysis → recalibrate what's working

**Caption editing tip:** Always review and personalize the Hebrew caption — AI tends toward formal Modern Hebrew. Satya's voice is warmer and more conversational.`,
  },
  {
    id: 'virality',
    title: '⚡ Virality Scores',
    content: `Every Waterfall output card shows a virality score (0–100) in the top-right corner.

- 🟢 **80–100** — High virality. Strong hook, clear format fit, high pillar alignment. Produce this first.
- 🟡 **60–79** — Good. Solid piece but needs a stronger hook or sharper edit.
- 🔴 **0–59** — Lower priority. May still be valuable but less likely to drive reach.

**Hover** the badge to see the specific reason (e.g., "Strong hook + devotional emotion = high shareability for bhakti audience").

These scores are generated by AI at creation time — they reflect hook strength, format fit, and audience alignment, not actual Instagram analytics.`,
  },
  {
    id: 'shortcuts',
    title: '⌨️ Keyboard Shortcuts',
    table: {
      headers: ['Key', 'Page'],
      rows: [
        ['C', 'Create'],
        ['K', 'Calendar'],
        ['W', 'Waterfall'],
        ['L', 'Library'],
        ['G', 'GSB Analysis'],
        ['?', 'This help page'],
      ],
    },
  },
  {
    id: 'tips',
    title: '💡 Tips for Best Results',
    content: `**Be specific in your intent field.** "Sunday kirtan recap" → mediocre. "Sunday kirtan recap — Hare Krishna mahamantra, 40 people, outdoor, emotional energy" → sharp, specific, on-brand output.

**Use Collab mode for events.** When announcing a specific event with dates, location, and custom details, use Collab mode — give Tank the facts and let him write around them.

**Waterfall after every class.** Even a 5-minute recording can produce 3–4 usable pieces. Paste the transcript, pick the top 3 virality scores, schedule them for the week.

**GSB monthly, minimum.** The audience changes over time. What worked 3 months ago may not land today. GSB keeps the strategy calibrated.

**Hebrew captions need a human touch.** Review every Hebrew caption before saving. AI handles the structure well but Satya's warmth and personal voice need to be added manually.`,
  },
]

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto mt-2 rounded-lg" style={{ border: '1px solid #DDD3C2' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#F5F0E8' }}>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: '#8B7355', fontFamily: 'DM Sans, sans-serif' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: '1px solid #E8DDD0' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-sm" style={{ color: '#4A3728', fontFamily: 'DM Sans, sans-serif' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContentBlock({ text }) {
  const lines = text.split('\n')
  return (
    <div className="text-sm leading-relaxed space-y-1 mt-2" style={{ color: '#6B5B45', fontFamily: 'DM Sans, sans-serif' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <div key={i}>
            {parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} style={{ color: '#2C2416', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Section({ section }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #DDD3C2' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ background: open ? '#FDFAF6' : '#F5F0E8' }}
      >
        <span className="font-semibold text-sm" style={{ color: '#2C2416', fontFamily: 'Playfair Display, serif' }}>
          {section.title}
        </span>
        <span className="text-sm" style={{ color: '#A89880' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4" style={{ background: '#F5F0E8' }}>
          {section.content && <ContentBlock text={section.content} />}
          {section.table && <Table headers={section.table.headers} rows={section.table.rows} />}
          {section.subsections?.map((sub, i) => (
            <div key={i} className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#2D6A4F', fontFamily: 'DM Sans, sans-serif' }}>
                {sub.title}
              </div>
              {sub.content && <ContentBlock text={sub.content} />}
              {sub.table && <Table headers={sub.table.headers} rows={sub.table.rows} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? SECTIONS.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.content || '').toLowerCase().includes(search.toLowerCase()) ||
        s.subsections?.some(sub =>
          (sub.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (sub.content || '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : SECTIONS

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#2C2416', fontFamily: 'Playfair Display, serif' }}>
          🌸 Radhika Content Studio — User Guide
        </h1>
        <p className="text-sm" style={{ color: '#A89880', fontFamily: 'DM Sans, sans-serif' }}>
          Everything Satya needs to run the Radhika Instagram flawlessly.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search help..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: 'white',
            border: '1px solid #DDD3C2',
            color: '#2C2416',
            fontFamily: 'DM Sans, sans-serif',
          }}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-8" style={{ color: '#A89880' }}>No results for "{search}"</div>
        )}
        {filtered.map(s => <Section key={s.id} section={s} />)}
      </div>

      <div className="mt-8 text-center text-xs" style={{ color: '#C4B49A', fontFamily: 'DM Sans, sans-serif' }}>
        Radhika Content Studio · Built by Tank · Questions → Eshel or Satya
      </div>
    </div>
  )
}
