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

export async function getNotifications() {
  return fetchNotificationsApi();
}

export async function markNotificationAsRead(id) {
  return fetchNotificationsApi(`/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsAsRead() {
  return fetchNotificationsApi('/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id) {
  return fetchNotificationsApi(`/${id}`, { method: 'DELETE' });
}
