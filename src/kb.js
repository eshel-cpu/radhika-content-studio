/**
 * kb.js — Knowledge Base + Coordinator proxy helpers
 */

const KB_URL = process.env.KB_RAILWAY_URL || 'https://ultimate-external-knowledge-base.up.railway.app';
const COORDINATOR_URL = process.env.COORDINATOR_URL || 'https://coordinator-agent-production-f49d.up.railway.app';

/**
 * Search the Super Claude KB
 * @param {string} query
 * @returns {Promise<object>}
 */
async function searchKB(query) {
  try {
    const url = `${KB_URL}/api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { error: `KB returned ${res.status}` };
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Ask the Tank coordinator a question
 * @param {string} message
 * @returns {Promise<object>}
 */
async function askCoordinator(message) {
  try {
    const url = `${COORDINATOR_URL}/api/ask`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: 'radhika-studio' }),
      signal: AbortSignal.timeout(55000),
    });
    if (!res.ok) return { error: `Coordinator returned ${res.status}` };
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

module.exports = { searchKB, askCoordinator };
