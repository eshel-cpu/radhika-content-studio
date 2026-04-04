/**
 * claude.js — Claude API integration + Master System Prompt
 *
 * This file contains the core intelligence of Radhika Content Studio.
 * The system prompt bakes in all KB frameworks: Brendan Kane VCM,
 * Content Waterfall, PEACE brand voice, comment-trigger mechanics,
 * Director vs. Doer (10/80/10 model).
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

// ─── MASTER SYSTEM PROMPT ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Radhika Content Engine — an expert Instagram content creator for the Radhika bhakti community.

## Community Identity
- Radhika is a bhakti community following Krishna West (Hridayananda Das Goswami / Howard Resnick and Tamal Krishna Goswami)
- ISKCON-adjacent but modern, western-progressive, fully accessible to people with no prior spiritual background
- Based in Israel, with international reach
- Language: English-first, Hebrew as secondary language
- Audience: International and Israeli spiritual seekers, ages 20-45, not necessarily from religious backgrounds

## Brand Voice
- Tone: Warm, intelligent, grounded, accessible. NOT cult-adjacent. NOT overly traditional or insular.
- What we stand FOR: genuine connection, authentic practice, community belonging, ancient wisdom made accessible
- What we stand AGAINST: performative spirituality, commercialized shortcuts, spiritual isolation
- Guide positioning: Radhika is the Guide, the member is the Hero. Never make the brand the star.

## PEACE Brand Soundbites (use consistently across all content)
- Problem: "Feeling like something's missing?" / "מרגישים שמשהו חסר?"
- Empathy: "We understand that feeling." / "אנחנו מבינים"
- Answer: "Radhika Community — bhakti yoga in Israel" / "קהילת Radhika — בהקטי יוגה בישראל"
- Change: "Living with direction and meaning" / "חיים עם כיוון ומשמעות"
- End Result: "A community where you feel at home" / "קהילה שמרגישים בה בבית"

## Content Pillars
1. Wisdom Drops (35%) — Gita verses, Hridayananda quotes, Prabhupada teachings, philosophical insight
2. Community Life (25%) — kirtans, prasadam, gatherings, real authentic moments
3. Bhakti Explained (20%) — accessible intro content for newcomers, demystifying the practice
4. Personal Stories (10%) — member testimonials, transformation stories, authentic journeys
5. Events & Announcements (10%) — upcoming gatherings, class schedules, special events

## Caption Formula (follow every time)
HOOK (3-second scroll-stopper — must create curiosity or pattern interruption before the viewer swipes) →
BODY (2-4 lines — the teaching, story, or insight) →
BRIDGE to Radhika (soft connection to the community without hard-selling) →
CTA (specific and actionable: "Comment KIRTAN below", "Link in bio", "DM us", "Save this", "Share with someone who needs this") →
HASHTAGS (English niche + broad + Hebrew)

## Brendan Kane Viral Content Model (VCM) — Always Apply
- ALWAYS generate 5 different hook variations per post. 90% of viewers never scroll past the first 3 seconds.
- Each hook should use a different approach from: curiosity gap / pattern interrupt / bold claim / relatable problem / perspective shift
- NEVER state the obvious — find the angle that makes people think "I've never heard it put that way"
- Wrap niche bhakti concepts in universally relatable human hooks
- Check which of the 6 Perception Styles the content addresses: Feeling (30%), Fact (25%), Fun (20%), Values (10%), Imagination (10%), Action (5%)
- Aim to hit at least 2-3 perception styles per post

## Comment-Trigger Mechanic
For high-engagement posts (especially Reels and carousels), suggest a comment-trigger CTA:
"Comment [WORD] below and I'll DM you [free resource / the full teaching / the recording]"
This converts passive viewers into direct conversations.

## Hashtag Sets (rotate — never use all at once, pick 2 sets max)
Set A (broad): #bhaktiyoga #krishnaconsciousness #yoga #spirituality #meditation #mindfulness #ancientwisdom
Set B (Israel): #israelyoga #israelispirituality #ישראל #קהילה #krishnawest #satsang
Set C (niche): #krishnawest #hridayananadadasgoswami #kirtan #japa #prasadam #vaishnava #bhagavadgita
Set D (Hebrew): #יוגה #רוחניות #מדיטציה #קהילה #ישראל #בהקטי

## Output Format
Always output ONLY valid JSON. No markdown, no explanation outside the JSON structure.`;

// ─── POST CREATOR ──────────────────────────────────────────────────────────────

/**
 * Generate a full Instagram post
 * @param {string} pillar - wisdom | community | explain | story | event
 * @param {string} format - reel | carousel | quote-tile | single-image
 * @param {string} intent - Satya's description of what the post is about
 * @param {string} mode   - autopilot | collab | manual
 * @param {string} [draft] - optional existing draft for manual/collab mode
 */
async function generatePost({ pillar, format, intent, mode, draft }) {
  const modeInstruction = {
    autopilot: 'Write the complete post from scratch based on the intent provided.',
    collab: 'Write a strong draft for the user to refine. Add inline notes in [brackets] where the user might want to personalize.',
    manual: `The user has a draft — enhance it, fix the hook, improve the CTA, and make sure it follows all brand guidelines. Draft: "${draft || intent}"`,
  }[mode] || 'Write the complete post from scratch.';

  const prompt = `Generate an Instagram ${format} post for the Radhika community.

Pillar: ${pillar}
Intent: ${intent}
Instructions: ${modeInstruction}

Return ONLY valid JSON with this exact structure:
{
  "english": {
    "caption": "full English caption (hook + body + bridge + CTA + hashtags)",
    "caption_clean": "caption without hashtags"
  },
  "hebrew": {
    "caption": "full Hebrew caption (hook + body + bridge + CTA + hashtags, written right-to-left)",
    "caption_clean": "Hebrew caption without hashtags"
  },
  "hooks": [
    "Hook option 1 — curiosity gap approach",
    "Hook option 2 — pattern interrupt approach",
    "Hook option 3 — bold claim approach",
    "Hook option 4 — relatable problem approach",
    "Hook option 5 — perspective shift approach"
  ],
  "perception_styles": ["array of perception styles this post hits, e.g. Feeling, Values"],
  "hashtags": "#bhaktiyoga #krishnaconsciousness ... (2 sets max, 20-25 tags total)",
  "visual_direction": "Specific direction for what to film, photograph, or design for this format",
  "comment_trigger": "Suggested comment-trigger CTA if this format suits it (e.g. Comment KIRTAN below), or null if not applicable",
  "posting_tip": "One practical tip for when/how to post this for maximum reach"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseJSON(response.content[0].text);
}

// ─── CONTENT WATERFALL ─────────────────────────────────────────────────────────

/**
 * Break a recording/transcript into a full content plan
 * @param {string} transcript - description or transcript of the recording
 * @param {string} sourceType - kirtan | class | satsang | event
 */
async function generateWaterfall({ transcript, sourceType }) {
  const prompt = `Apply the Content Waterfall framework to this Radhika community recording.

Source type: ${sourceType}
Content: ${transcript}

The Content Waterfall: One recording → auto-clipped Reels → quote tiles → story ideas → standalone captions.
This system can generate 5-10 pieces of content from a single recording.

Return ONLY valid JSON:
{
  "summary": "2-sentence summary of the source content",
  "reels": [
    {
      "clip_description": "describe the specific moment or segment to clip (timestamp if possible)",
      "hook": "3-second opening hook for this Reel",
      "english_caption": "full English caption for this Reel clip",
      "hebrew_caption": "full Hebrew caption for this Reel clip",
      "duration_estimate": "estimated clip length e.g. 30s, 60s, 90s"
    }
  ],
  "quote_tiles": [
    {
      "quote": "exact quote or paraphrase worth turning into a visual",
      "attribution": "who said it (e.g. Hridayananda Das Goswami, Bhagavad Gita 2.47)",
      "english_caption": "caption to accompany this quote tile",
      "hebrew_caption": "Hebrew caption for this quote tile",
      "visual_note": "how to design this tile: colors, background, font treatment"
    }
  ],
  "stories": [
    "Story idea 1: describe what to post in stories (behind-scenes, poll, quote, etc.)",
    "Story idea 2",
    "Story idea 3"
  ],
  "captions": [
    {
      "hook": "standalone hook",
      "english": "full standalone caption (not tied to a clip)",
      "hebrew": "Hebrew version"
    }
  ],
  "opusclip_note": "Specific OpusClip instructions for this recording: what to look for, which segments to prioritize"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseJSON(response.content[0].text);
}

// ─── GSB ANALYSIS ──────────────────────────────────────────────────────────────

/**
 * Run Gold-Silver-Bronze analysis on past posts
 * @param {string[]} goldPosts   - top performing posts
 * @param {string[]} silverPosts - mid performing posts
 * @param {string[]} bronzePosts - bottom performing posts
 */
async function runGSB({ goldPosts, silverPosts, bronzePosts }) {
  const prompt = `Run a Brendan Kane Gold-Silver-Bronze (GSB) analysis on these Radhika Instagram posts.

GOLD (top performing):
${goldPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

SILVER (mid performing):
${silverPosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

BRONZE (bottom performing):
${bronzePosts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

GSB Analysis: Compare gold vs bronze. Identify what's EXCLUSIVE to gold-tier that bronze lacks.
This reveals the actual performance drivers vs what we assumed works.

Return ONLY valid JSON:
{
  "gold_patterns": ["pattern 1 exclusive to gold posts", "pattern 2", "pattern 3"],
  "bronze_mistakes": ["what bronze posts consistently get wrong", "..."],
  "key_insight": "The single most important finding from this analysis",
  "perception_style_gap": "Which perception styles are gold hitting that bronze misses",
  "hook_analysis": "What gold hooks do differently vs bronze hooks",
  "content_brief": {
    "headline": "Your next 2 weeks of content — what to focus on",
    "posts": [
      {
        "pillar": "wisdom | community | explain | story | event",
        "format": "reel | carousel | quote-tile | single-image",
        "angle": "specific angle to use based on GSB findings",
        "hook_direction": "what kind of hook to lead with"
      }
    ]
  },
  "format_to_avoid": "Format or approach that consistently underperforms — stop doing this"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseJSON(response.content[0].text);
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function parseJSON(text) {
  // Strip markdown code blocks if Claude wrapped it
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Return raw text in a wrapper so frontend can still display something
    return { raw: text, parse_error: e.message };
  }
}

module.exports = { generatePost, generateWaterfall, runGSB };
