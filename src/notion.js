/**
 * notion.js — Radhika Content Library sync
 * Saves and retrieves posts from the Radhika Content Library Notion database.
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DB_ID = process.env.NOTION_RADHIKA_DB_ID;
const NOTION_VERSION = '2022-06-28';

function headers() {
  return {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function truncate(str, max = 2000) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) : str;
}

/**
 * Save a post to Notion. Returns the created page ID.
 */
async function savePost(post) {
  if (!NOTION_API_KEY || !NOTION_DB_ID) throw new Error('Notion not configured');

  const { id, pillar, format, intent, status = 'draft', result = {}, createdAt } = post;

  const enCaption = result.english?.caption_clean || result.english?.caption || '';
  const heCaption = result.hebrew?.caption_clean || result.hebrew?.caption || '';
  const hooks = (result.hooks || []).join('\n\n');
  const visualDirection = result.visual_direction || '';

  const properties = {
    'Title': {
      title: [{ text: { content: truncate(intent || 'Untitled', 200) } }],
    },
    'Pillar': pillar ? { select: { name: pillar } } : undefined,
    'Format': { rich_text: [{ text: { content: truncate(format || '', 200) } }] },
    'Status': { select: { name: status } },
    'EN Caption': { rich_text: [{ text: { content: truncate(enCaption) } }] },
    'HE Caption': { rich_text: [{ text: { content: truncate(heCaption) } }] },
    'Hooks': { rich_text: [{ text: { content: truncate(hooks) } }] },
    'Visual Direction': { rich_text: [{ text: { content: truncate(visualDirection) } }] },
    'Created At': createdAt ? { date: { start: new Date(createdAt).toISOString() } } : undefined,
  };

  // Remove undefined properties
  Object.keys(properties).forEach(k => properties[k] === undefined && delete properties[k]);

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion save failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Update status of an existing Notion page.
 */
async function updatePostStatus(notionPageId, status) {
  if (!NOTION_API_KEY) throw new Error('Notion not configured');

  const res = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        'Status': { select: { name: status } },
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion update failed ${res.status}: ${err.slice(0, 200)}`);
  }
}

/**
 * List all posts from Notion, sorted by Created At descending.
 * Returns array of post objects compatible with the frontend library format.
 */
async function listPosts() {
  if (!NOTION_API_KEY || !NOTION_DB_ID) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      sorts: [{ property: 'Created At', direction: 'descending' }],
      page_size: 100,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion list failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();

  return (data.results || []).map(page => {
    const p = page.properties;
    const getText = field => p[field]?.rich_text?.[0]?.plain_text || '';

    return {
      id: page.id,
      notionPageId: page.id,
      intent: p['Title']?.title?.[0]?.plain_text || '',
      pillar: p['Pillar']?.select?.name || '',
      format: getText('Format'),
      status: p['Status']?.select?.name || 'draft',
      createdAt: p['Created At']?.date?.start || page.created_time,
      result: {
        english: { caption_clean: getText('EN Caption') },
        hebrew: { caption_clean: getText('HE Caption') },
        hooks: getText('Hooks').split('\n\n').filter(Boolean),
        visual_direction: getText('Visual Direction'),
      },
    };
  });
}

module.exports = { savePost, updatePostStatus, listPosts };
