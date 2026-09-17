const API_BASE = 'http://localhost:5131/api/notifications';

/**
 * Fetch wrapper for vendor notifications API
 */
export async function fetchNotificationsApi(urlPath = '', options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${urlPath}`;
  return await fetch(url, { ...options, headers });
}
