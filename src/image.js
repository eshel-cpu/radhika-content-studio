/**
 * image.js — Image generation via Ideogram v2 + fal.ai FLUX Pro
 *
 * Ideogram v2  → quote tiles (best text rendering: 90-95% accuracy)
 * fal.ai FLUX  → scene/reel cover images (best aesthetic quality, 1-3s)
 */

const IDEOGRAM_KEY = process.env.IDEOGRAM_API_KEY;
const FAL_KEY = process.env.FAL_API_KEY;

// ─── SHARED BRAND CONTEXT ──────────────────────────────────────────────────────

const BRAND_SUFFIX = `
Radhika bhakti community brand. Warm, earthy, premium aesthetic.
Brand colors: cream #FAF7F2, forest green #2D6A4F, warm gold #C9972C, terracotta #C4724A.
Clean, minimal, spiritual. No faces. No people. No deities. No religious symbols that could offend.
Instagram square 1:1 format. High resolution.`.trim();

// ─── IDEOGRAM v2 — QUOTE TILES ─────────────────────────────────────────────────

/**
 * Generate a quote tile image using Ideogram v2
 * Best for: text-heavy designs, quote tiles, single-image posts
 *
 * @param {string} visualDirection - Claude's visual direction for this post
 * @param {string} pillar - wisdom | community | explain | story | event
 * @param {string} quote - the quote to render (optional — for prompt enrichment)
 */
async function generateQuoteTile({ visualDirection, pillar, quote }) {
  if (!IDEOGRAM_KEY) throw new Error('IDEOGRAM_API_KEY not set');

  const pillarStyle = {
    wisdom:    'Deep forest green background with warm cream text. Minimalist, contemplative.',
    community: 'Warm terracotta tones, organic textures, joyful energy.',
    explain:   'Soft gold gradient, clean and inviting, approachable.',
    story:     'Warm cream background, personal, authentic, heartfelt.',
    event:     'Deep ink background with gold accents, elegant announcement style.',
  }[pillar] || 'Warm earthy tones, spiritual aesthetic.';

  const prompt = [
    visualDirection,
    pillarStyle,
    quote ? `Feature this text prominently: "${quote.slice(0, 120)}"` : '',
    'Typography-focused design. Playfair Display or similar serif font.',
    'Radhika community Instagram post. No logos. Minimal, premium spiritual aesthetic.',
    'Square format 1080x1080.',
  ].filter(Boolean).join(' ');

  const res = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': IDEOGRAM_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        aspect_ratio: 'ASPECT_1_1',
        model: 'V_2_TURBO',
        style_type: 'DESIGN',
        magic_prompt_option: 'AUTO',
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ideogram error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const imageUrl = data?.data?.[0]?.url;
  if (!imageUrl) throw new Error('Ideogram returned no image URL');

  return {
    url: imageUrl,
    provider: 'ideogram-v2',
    model: 'V_2_TURBO',
    prompt: prompt.slice(0, 200),
  };
}

// ─── fal.ai FLUX Pro — SCENE / REEL COVERS ─────────────────────────────────────

/**
 * Generate a scene/background image using fal.ai FLUX Pro
 * Best for: Reel covers, atmospheric backgrounds, nature/spiritual scenes
 *
 * @param {string} visualDirection - Claude's visual direction for this post
 * @param {string} pillar - content pillar (affects mood/color)
 */
async function generateSceneImage({ visualDirection, pillar }) {
  if (!FAL_KEY) throw new Error('FAL_API_KEY not set');

  const pillarMood = {
    wisdom:    'Contemplative, ancient, golden hour light filtering through trees or temple architecture.',
    community: 'Warm gathering energy, candlelight, flowers, prasadam spread, joyful community.',
    explain:   'Open, welcoming, gentle morning light, nature, accessible and peaceful.',
    story:     'Personal, intimate, soft focus, golden bokeh, human warmth without showing faces.',
    event:     'Celebratory, auspicious, marigolds, lamps, festive Indian spiritual aesthetic.',
  }[pillar] || 'Warm Indian spiritual aesthetic, nature, golden light.';

  const prompt = [
    visualDirection,
    pillarMood,
    'Cinematic quality, warm golden hour lighting, Indian spiritual aesthetic.',
    'Nature elements: lotus, water, forest, mountains, or temple architecture.',
    'Soft bokeh background, photorealistic, no text, no people, no faces.',
    BRAND_SUFFIX,
  ].join(' ');

  const res = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'square_hd',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('fal.ai returned no image URL');

  return {
    url: imageUrl,
    provider: 'fal-flux-pro',
    model: 'flux-pro',
    prompt: prompt.slice(0, 200),
  };
}

module.exports = { generateQuoteTile, generateSceneImage };
