/**
 * api.js — authenticated fetch wrapper for Radhika Content Studio
 *
 * Stores token as 'radhikaToken' in localStorage.
 * On 401: clears token + reloads (forces login screen).
 */

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('radhikaToken') || '';

  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('radhikaToken');
    window.location.reload();
    return null;
  }

  return res;
}
