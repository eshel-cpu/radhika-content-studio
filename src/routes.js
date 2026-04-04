/**
 * routes.js — All API routes for Radhika Content Studio
 */

const express = require('express');
const router = express.Router();
const { generatePost, generateWaterfall, runGSB } = require('./claude');
const { searchKB } = require('./kb');
const { generateQuoteTile, generateSceneImage } = require('./image');

// ─── HEALTH ────────────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
  res.json({
    service: 'radhika-content-studio',
    status: 'ok',
    timestamp: new Date().toISOString(),
    kb: process.env.KB_RAILWAY_URL ? 'configured' : 'not set',
    ai: process.env.ANTHROPIC_API_KEY ? 'configured' : 'NOT SET',
  });
});

// Auth check endpoint — returns 200 if token is valid (auth middleware runs first)
router.get('/auth', (req, res) => {
  res.json({ ok: true });
});

// ─── POST CREATOR ──────────────────────────────────────────────────────────────

/**
 * POST /api/create
 * Body: { pillar, format, intent, mode, draft? }
 * Returns: { english, hebrew, hooks, perception_styles, hashtags, visual_direction, comment_trigger, posting_tip }
 */
router.post('/create', async (req, res) => {
  const { pillar, format, intent, mode, draft } = req.body;

  if (!pillar || !format || !intent) {
    return res.status(400).json({ error: 'pillar, format, and intent are required' });
  }

  try {
    const result = await generatePost({ pillar, format, intent, mode: mode || 'autopilot', draft });
    res.json(result);
  } catch (e) {
    console.error('[create] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── CONTENT WATERFALL ─────────────────────────────────────────────────────────

/**
 * POST /api/waterfall
 * Body: { transcript, sourceType }
 * Returns: { summary, reels, quote_tiles, stories, captions, opusclip_note }
 */
router.post('/waterfall', async (req, res) => {
  const { transcript, sourceType } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  try {
    const result = await generateWaterfall({
      transcript,
      sourceType: sourceType || 'class',
    });
    res.json(result);
  } catch (e) {
    console.error('[waterfall] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GSB ANALYSIS ──────────────────────────────────────────────────────────────

/**
 * POST /api/gsb
 * Body: { goldPosts: string[], silverPosts: string[], bronzePosts: string[] }
 * Returns: { gold_patterns, bronze_mistakes, key_insight, perception_style_gap, hook_analysis, content_brief, format_to_avoid }
 */
router.post('/gsb', async (req, res) => {
  const { goldPosts, silverPosts, bronzePosts } = req.body;

  if (!goldPosts?.length || !silverPosts?.length || !bronzePosts?.length) {
    return res.status(400).json({ error: 'goldPosts, silverPosts, and bronzePosts arrays are required' });
  }

  try {
    const result = await runGSB({ goldPosts, silverPosts, bronzePosts });
    res.json(result);
  } catch (e) {
    console.error('[gsb] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── KB PROXY ──────────────────────────────────────────────────────────────────

/**
 * GET /api/kb/search?q=query
 * Proxies to Super Claude KB
 */
router.get('/kb/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q query param required' });

  const result = await searchKB(q);
  res.json(result);
});

// ─── IMAGE GENERATION ──────────────────────────────────────────────────────────

/**
 * POST /api/generate-image
 * Body: { type, visualDirection, pillar, quote? }
 * type: 'tile' → Ideogram v2 | 'scene' → fal.ai FLUX Pro
 */
router.post('/generate-image', async (req, res) => {
  const { type, visualDirection, pillar, quote } = req.body;

  if (!visualDirection) {
    return res.status(400).json({ error: 'visualDirection is required' });
  }

  try {
    let result;
    if (type === 'tile') {
      result = await generateQuoteTile({ visualDirection, pillar, quote });
    } else {
      result = await generateSceneImage({ visualDirection, pillar });
    }
    res.json(result);
  } catch (e) {
    console.error('[generate-image] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
