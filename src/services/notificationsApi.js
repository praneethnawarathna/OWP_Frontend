const LOCAL_BASE = 'http://localhost:5131/api/notifications';
const REMOTE_BASE = 'https://owpbackend-production.up.railway.app/api/notifications';

/**
 * Fetch wrapper that prioritizes the local backend (http://localhost:5131)
 * but automatically fails over to the deployed Railway backend if the local server is offline.
 */
export async function fetchNotificationsApi(urlPath = '', options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const localUrl = `${LOCAL_BASE}${urlPath}`;
  const remoteUrl = `${REMOTE_BASE}${urlPath}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(localUrl, {
      ...options,
      headers,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);

    // If local answered (success or auth error), return it
    if (res.ok || res.status === 401 || res.status === 403) {
      return res;
    }
    // If local returned a 404 or 5xx, try remote
    return await fetch(remoteUrl, { ...options, headers });
  } catch (err) {
    // Local server offline or connection refused -> fallback to Railway
    return await fetch(remoteUrl, { ...options, headers });
  }
}
