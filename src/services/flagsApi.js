/**
 * flagsApi.js
 * Frontend API service for the Report / Flag Listing feature.
 *
 * Endpoints consumed:
 *   GET  /api/flags/admin          – Admin dashboard: all flags
 *   GET  /api/flags/vendor/{id}    – Vendor dashboard: flags for a specific vendor
 *   PATCH /api/flags/{id}/status   – Admin: update flag status
 */
import { API_BASE_URL } from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}/flags`;

/** Generic authenticated fetch wrapper */
async function flagsFetch(urlPath = '', options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const url = `${API_BASE}${urlPath}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || body?.detail || `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * Fetch all flagged items for the admin dashboard.
 * @returns {Promise<FlaggedItemDto[]>}
 */
export async function fetchAdminFlags() {
  return flagsFetch('/admin');
}

/**
 * Update a flag's workflow status.
 * @param {number} id - Flag ID
 * @param {string} status - New status: 'Open' | 'UnderReview' | 'Dismissed' | 'ContentRemoved'
 * @param {string} [resolutionNote] - Optional note for Dismissed / ContentRemoved
 */
export async function updateFlagStatus(id, status, resolutionNote = '') {
  return flagsFetch(`/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resolutionNote }),
  });
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

/**
 * Fetch all flags targeting a specific vendor's listings.
 * Prioritizes /vendor/my-flags when authenticated token exists.
 * @param {number} [vendorId]
 * @returns {Promise<FlaggedItemDto[]>}
 */
export async function fetchVendorFlags(vendorId) {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const myFlags = await flagsFetch('/vendor/my-flags');
      if (Array.isArray(myFlags)) return myFlags;
    } catch {
      // Fallback to explicit vendorId path
    }
  }
  if (vendorId) {
    return flagsFetch(`/vendor/${vendorId}`);
  }
  return flagsFetch('/vendor/my-flags');
}
