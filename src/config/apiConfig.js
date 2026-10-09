/**
 * Oleena Frontend API & Asset Configuration
 *
 * Automatically resolves the backend API URL and asset URL.
 * Prioritizes:
 *  1. import.meta.env.VITE_API_URL
 *  2. import.meta.env.VITE_API_BASE_URL
 *  3. Fallback: https://owpbackend-production.up.railway.app
 *
 * Gracefully handles:
 *  - URLs with or without trailing slash (e.g., https://xyz.railway.app/ or https://xyz.railway.app)
 *  - URLs provided with or without '/api' (e.g., https://xyz.railway.app/api or https://xyz.railway.app)
 */

const envUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://owpbackend-production.up.railway.app'
).trim();

// Strip any trailing slashes
const sanitizedUrl = envUrl.replace(/\/+$/, '');

// BACKEND_URL is always the root host without trailing '/api' (e.g. "https://oleena-backend.up.railway.app")
export const BACKEND_URL = sanitizedUrl.endsWith('/api')
  ? sanitizedUrl.slice(0, -4)
  : sanitizedUrl;

// API_BASE_URL is always the full API base ending with '/api' (e.g. "https://oleena-backend.up.railway.app/api")
export const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Resolves static asset and media URLs (e.g. /uploads/photos/xyz.jpg).
 * Preserves external (http/https), data, and blob URLs.
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default {
  BACKEND_URL,
  API_BASE_URL,
  getAssetUrl,
};
