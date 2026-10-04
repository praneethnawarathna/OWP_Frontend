import { searchBuiltIn } from './sriLankaPlaces';

// Sri Lanka bounding box for bias
const LK_BBOX = { minLon: 79.4, minLat: 5.8, maxLon: 82.0, maxLat: 9.9 };

/**
 * Returns true if the coordinate falls within Sri Lanka's bounding box.
 */
function inSriLanka(lat, lng) {
  return (
    lat >= LK_BBOX.minLat &&
    lat <= LK_BBOX.maxLat &&
    lng >= LK_BBOX.minLon &&
    lng <= LK_BBOX.maxLon
  );
}

/**
 * Fetch with a timeout (ms). Throws on network error or timeout.
 */
async function fetchWithTimeout(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Provider Implementations ────────────────────────────────────────────────

async function searchOpenMeteo(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const data = await fetchWithTimeout(url);
  if (!data.results || data.results.length === 0) return [];

  return data.results
    .filter((r) => inSriLanka(r.latitude, r.longitude))
    .slice(0, 5)
    .map((r) => {
      const parts = [r.name, r.admin1].filter(Boolean);
      return {
        label: parts.join(', ') + ', Sri Lanka',
        lat: r.latitude,
        lng: r.longitude,
        source: 'Open-Meteo',
      };
    });
}

async function searchEsri(query) {
  const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(query)}&countryCode=LKA&maxLocations=10&outFields=City,Region,Subregion,PlaceName&category=`;
  const data = await fetchWithTimeout(url);
  if (!data.candidates || data.candidates.length === 0) return [];

  return data.candidates
    .filter((c) => inSriLanka(c.location.y, c.location.x) && c.score >= 70)
    .slice(0, 5)
    .map((c) => ({
      label: c.address,
      lat: c.location.y,
      lng: c.location.x,
      source: 'Esri',
    }));
}

async function searchPhoton(query) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en&bbox=${LK_BBOX.minLon},${LK_BBOX.minLat},${LK_BBOX.maxLon},${LK_BBOX.maxLat}`;
  const data = await fetchWithTimeout(url);
  if (!data.features || data.features.length === 0) return [];

  return data.features
    .filter((f) => {
      const [lon, lat] = f.geometry.coordinates;
      return inSriLanka(lat, lon);
    })
    .slice(0, 5)
    .map((f) => {
      const p = f.properties;
      const parts = [p.name, p.street, p.city, p.state].filter(Boolean);
      const [lon, lat] = f.geometry.coordinates;
      return {
        label: parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        lat,
        lng: lon,
        source: 'Photon',
      };
    });
}

async function searchNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=lk&q=${encodeURIComponent(query)}`;
  const data = await fetchWithTimeout(url, 6000);
  if (!Array.isArray(data) || data.length === 0) return [];

  return data
    .filter((r) => inSriLanka(parseFloat(r.lat), parseFloat(r.lon)))
    .slice(0, 5)
    .map((r) => ({
      label: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      source: 'Nominatim',
    }));
}

// ─── Provider Chain ───────────────────────────────────────────────────────────

const PROVIDERS = [
  { id: 'open-meteo', name: 'Open-Meteo',  fn: searchOpenMeteo },
  { id: 'esri',       name: 'Esri',        fn: searchEsri       },
  { id: 'photon',     name: 'Photon',      fn: searchPhoton     },
  { id: 'nominatim',  name: 'Nominatim',   fn: searchNominatim  },
];

/**
 * Search for a place in Sri Lanka.
 *
 * Tries providers in order until one returns ≥1 result.
 * Falls back to built-in town list if every provider fails.
 *
 * @param {string} query
 * @returns {Promise<{ results: Array<{label,lat,lng,source}>, sourceUsed: string, usedFallback: boolean }>}
 */
export async function searchPlace(query) {
  if (!query || query.trim() === '') {
    return { results: [], sourceUsed: null, usedFallback: false };
  }

  for (const provider of PROVIDERS) {
    try {
      const results = await provider.fn(query);
      if (results.length > 0) {
        return { results, sourceUsed: provider.name, usedFallback: false };
      }
    } catch (err) {
      console.warn(`[searchPlace] Provider "${provider.name}" failed:`, err.message);
    }
  }

  // Last resort: built-in list
  const builtIn = searchBuiltIn(query);
  return {
    results: builtIn,
    sourceUsed: builtIn.length > 0 ? 'built-in' : null,
    usedFallback: true,
  };
}

/**
 * Reverse geocode a latitude/longitude to a display address.
 * Tries Esri first (reliable on this machine), then Nominatim.
 *
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;

  // Esri reverse geocode
  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lon},${lat}&langCode=EN`;
    const data = await fetchWithTimeout(url);
    if (data && data.address && data.address.LongLabel) {
      return data.address.LongLabel;
    }
    if (data && data.address && data.address.Match_addr) {
      return data.address.Match_addr;
    }
  } catch (err) {
    console.warn('[reverseGeocode] Esri failed:', err.message);
  }

  // Nominatim reverse geocode (may be blocked but worth trying)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const data = await fetchWithTimeout(url);
    if (data && data.display_name) return data.display_name;
  } catch (err) {
    console.warn('[reverseGeocode] Nominatim failed:', err.message);
  }

  return null;
}
