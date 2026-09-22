/**
 * saveSession.js — Oleena Wedding Planner
 * Stores authentication token and normalized user profile in localStorage.
 * Matches LoginPage session saving conventions.
 */

export function saveSession(data) {
  if (!data) return;

  // Determine and normalize user role
  let resolvedRole = String(data.role || data.Role || '').toUpperCase();
  const token = data.token || data.Token || '';

  if (!resolvedRole && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      resolvedRole = String(
        payload.role ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload.Role ||
        ''
      ).toUpperCase();
    } catch {
      // ignore token parse error
    }
  }

  if (resolvedRole === 'SUPERADMIN' || resolvedRole.includes('SUPER')) {
    resolvedRole = 'SUPER_ADMIN';
  }

  if (!resolvedRole) {
    resolvedRole = 'VENDOR';
  }

  // Store JWT token
  if (token) {
    localStorage.setItem('token', token);
  }

  // Store user details with UPPERCASED role
  const user = {
    userId: data.userId ?? data.UserId ?? null,
    email: data.email ?? data.Email ?? '',
    fullName: data.fullName ?? data.FullName ?? '',
    role: resolvedRole,
  };

  localStorage.setItem('user', JSON.stringify(user));
}

export default saveSession;
