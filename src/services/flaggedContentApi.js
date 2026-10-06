const API_BASE = 'http://localhost:5131/api/flaggedcontent';

/**
 * Generic fetch wrapper for the Flagged Content API.
 * Attaches the JWT token from localStorage when available.
 */
async function flagsApiFetch(urlPath = '', options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${urlPath}`, { ...options, headers });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Normalise a raw API record into the shape the UI expects.
 * The DB model uses createdAt for the report date and has no vendorName/aiSuggestion.
 */
function normaliseFlag(raw) {
  return {
    // Numeric DB id -> string prefixed "F-" to keep badge/table IDs readable
    id: `F-${raw.id}`,
    _numericId: raw.id,
    contentType: raw.contentType ?? '',
    contentTitle: raw.contentTitle ?? '(no title)',
    contentSnippet: raw.contentSnippet ?? '',
    vendorName: raw.vendorName ?? raw.reportedBy ?? '\u2014',
    reason: raw.reason ?? '',
    reportedBy: raw.reportedBy ?? '',
    // Fall back gracefully: prefer reportedAt if the backend ever adds it
    reportedAt: raw.reportedAt
      ? raw.reportedAt.slice(0, 10)
      : raw.createdAt
        ? raw.createdAt.slice(0, 10)
        : '',
    status: raw.status ?? 'Open',
    severity: raw.severity ?? 'Medium',
    resolutionNote: raw.resolutionNote ?? '',
    reviewedAt: raw.reviewedAt
      ? raw.reviewedAt.slice(0, 10)
      : raw.updatedAt && raw.status !== 'Open' && raw.status !== 'UnderReview'
        ? raw.updatedAt.slice(0, 10)
        : '',
    aiSuggestion: raw.aiSuggestion ?? null,
  };
}

/** GET /api/flaggedcontent - returns all flags ordered by newest first. */
export async function getFlags() {
  const data = await flagsApiFetch();
  return data.map(normaliseFlag);
}

/**
 * PATCH /api/flaggedcontent/{id}/status
 * Updates the status of a single flag. Returns the updated record.
 */
export async function updateFlagStatus(numericId, status) {
  const raw = await flagsApiFetch(`/${numericId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return normaliseFlag(raw);
}
