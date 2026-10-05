// ============================================================
// LocationPicker.jsx
// Interactive Leaflet + OpenStreetMap location picker with
// Nominatim address search, marker dragging, reverse geocoding,
// geolocation, and radius overlay — no API key required.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Crosshair,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  Navigation,
  Loader2,
  Edit3,
  X,
} from 'lucide-react';

// ── Fix Leaflet default icon paths broken by bundlers ──────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom purple marker icon matching Oleena brand color
const purpleIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path fill="#8E406F" filter="url(#shadow)"
        d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
      <circle cx="16" cy="16" r="4" fill="#8E406F"/>
    </svg>
  `)}`,
  iconSize:   [32, 42],
  iconAnchor: [16, 42],
  popupAnchor:[0, -44],
});

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const DEFAULT_ZOOM_EMPTY    = 7;
const DEFAULT_ZOOM_SELECTED = 15;
const THEME_COLOR = '#8E406F';

// ── Nominatim helpers ─────────────────────────────────────────────────────
const NOMINATIM = 'https://nominatim.openstreetmap.org';

async function searchNominatim(query) {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=lk&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json();
}

// ── MapEvents: handles click-to-place and exposes map reference ───────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── FlyTo: smoothly animate map to new coords ────────────────────────────
function FlyController({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], zoom ?? DEFAULT_ZOOM_SELECTED, { duration: 1.2 });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

// ── Inline CSS for Leaflet container height ───────────────────────────────
const MAP_STYLE = { height: '340px', width: '100%', borderRadius: '12px', overflow: 'hidden' };

// ═════════════════════════════════════════════════════════════════════════════
// Main LocationPicker Component
// Props (same interface as previous Google Maps version):
//   latitude, longitude, locationAddress, googlePlaceId, radiusKm
//   onChange({ latitude, longitude, locationAddress, googlePlaceId })
//   label, required, error, disabled
// ═════════════════════════════════════════════════════════════════════════════
export default function LocationPicker({
  latitude,
  longitude,
  locationAddress,
  googlePlaceId,   // kept for API compatibility, not used by OSM
  radiusKm = 5,
  onChange,
  label = 'Service Location',
  required = false,
  error,
  disabled = false,
}) {
  const [searchQuery, setSearchQuery]       = useState('');
  const [suggestions, setSuggestions]       = useState([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [isLocating, setIsLocating]         = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geoError, setGeoError]             = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flyTarget, setFlyTarget]           = useState(null);
  const searchRef   = useRef(null);
  const debounceRef = useRef(null);

  const hasCoords =
    latitude != null && longitude != null &&
    !isNaN(Number(latitude)) && !isNaN(Number(longitude));

  const markerPos = hasCoords ? [Number(latitude), Number(longitude)] : null;

  // ── Emit change helper ─────────────────────────────────────────────────
  const emitChange = useCallback((lat, lng, address) => {
    onChange?.({
      latitude:        lat,
      longitude:       lng,
      locationAddress: address ?? locationAddress ?? '',
      googlePlaceId:   googlePlaceId ?? null,
    });
  }, [onChange, locationAddress, googlePlaceId]);

  // ── Debounced Nominatim search ─────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchNominatim(searchQuery);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // ── Pick a suggestion ─────────────────────────────────────────────────
  const handleSuggestionSelect = useCallback((place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const address = place.display_name;
    setSearchQuery(address);
    setSuggestions([]);
    setShowSuggestions(false);
    setFlyTarget({ lat, lng });
    emitChange(lat, lng, address);
  }, [emitChange]);

  // ── Map click → reverse geocode ───────────────────────────────────────
  const handleMapClick = useCallback(async (lat, lng) => {
    if (disabled) return;
    setFlyTarget({ lat, lng });
    setIsReverseGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      const address = result.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSearchQuery(address);
      emitChange(lat, lng, address);
    } catch {
      emitChange(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [disabled, emitChange]);

  // ── Marker drag end → reverse geocode ────────────────────────────────
  const handleMarkerDragEnd = useCallback(async (e) => {
    const { lat, lng } = e.target.getLatLng();
    setIsReverseGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      const address = result.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSearchQuery(address);
      emitChange(lat, lng, address);
    } catch {
      emitChange(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [emitChange]);

  // ── Geolocation ──────────────────────────────────────────────────────
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFlyTarget({ lat, lng });
        try {
          const result = await reverseGeocode(lat, lng);
          const address = result.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setSearchQuery(address);
          emitChange(lat, lng, address);
        } catch {
          emitChange(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [emitChange]);

  // ── Clear location ────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setFlyTarget(null);
    onChange?.({ latitude: null, longitude: null, locationAddress: '', googlePlaceId: null });
  }, [onChange]);

  // ── Close suggestion dropdown on outside click ────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Sync searchQuery with locationAddress prop ────────────────────────
  useEffect(() => {
    if (locationAddress && !searchQuery) setSearchQuery(locationAddress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationAddress]);

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-[#1E293B]">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* ── Search bar ──────────────────────────────────────────────── */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for a city, venue, or address in Sri Lanka…"
              disabled={disabled}
              className={`w-full rounded-xl border bg-white pl-9 pr-9 py-2.5 text-sm text-[#1E293B]
                outline-none placeholder:text-[#94A3B8] transition
                ${error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-[#E8DDE4] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E406F] animate-spin" />
            )}
            {!isSearching && searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] hover:text-[#8E406F] transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Geolocate button */}
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={disabled || isLocating}
            title="Use my current location"
            className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl border border-[#E8DDE4]
              bg-white text-[#8E406F] hover:bg-[#FCF8FA] hover:border-[#8E406F] transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Crosshair className="h-4 w-4" />
            }
          </button>

          {/* Clear button (when coords set) */}
          {hasCoords && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              title="Clear location"
              className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl border border-[#E8DDE4]
                bg-white text-[#94A3B8] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-[9999] mt-1 w-full rounded-xl border border-[#E8DDE4] bg-white shadow-lg
            overflow-hidden max-h-56 overflow-y-auto">
            {suggestions.map((place) => (
              <li key={place.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSuggestionSelect(place)}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#FCF8FA]
                    hover:text-[#8E406F] transition flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#8E406F]" />
                  <span className="line-clamp-2">{place.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Geo / reverse-geocode errors */}
      {geoError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {geoError}
        </div>
      )}

      {/* Instruction hint */}
      {!hasCoords && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-600">
          <Navigation className="h-3.5 w-3.5 shrink-0" />
          Search for an address above, or click anywhere on the map to pin your venue location.
        </div>
      )}

      {/* ── Leaflet Map ─────────────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden border border-[#E8DDE4] shadow-sm">
        {/* Reverse-geocoding spinner overlay */}
        {isReverseGeocoding && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm text-[#8E406F] font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding address…
            </div>
          </div>
        )}

        <MapContainer
          center={markerPos ?? SRI_LANKA_CENTER}
          zoom={hasCoords ? DEFAULT_ZOOM_SELECTED : DEFAULT_ZOOM_EMPTY}
          style={MAP_STYLE}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Fly to new coords when search/geolocate updates flyTarget */}
          {flyTarget && <FlyController lat={flyTarget.lat} lng={flyTarget.lng} />}

          {/* Click anywhere to place marker */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Marker + radius circle */}
          {markerPos && (
            <>
              <Marker
                position={markerPos}
                icon={purpleIcon}
                draggable={!disabled}
                eventHandlers={{ dragend: handleMarkerDragEnd }}
              />
              {radiusKm > 0 && (
                <Circle
                  center={markerPos}
                  radius={radiusKm * 1000}
                  pathOptions={{
                    color:       THEME_COLOR,
                    fillColor:   THEME_COLOR,
                    fillOpacity: 0.08,
                    weight:      1.5,
                    dashArray:   '5 4',
                  }}
                />
              )}
            </>
          )}
        </MapContainer>

        {/* Confirmed badge */}
        {hasCoords && (
          <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-1.5
            bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-full
            px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            <Check className="h-3 w-3" />
            Location set
          </div>
        )}

        {/* Drag hint */}
        {hasCoords && !disabled && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500]
            bg-white/90 backdrop-blur-sm border border-[#E8DDE4] rounded-full
            px-3 py-1 text-[11px] text-[#64748B] shadow-sm flex items-center gap-1">
            <Edit3 className="h-3 w-3" />
            Drag the pin to fine-tune
          </div>
        )}
      </div>

      {/* ── Address + Coordinates row ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#1E293B] mb-1">
            Confirmed Location Address / Venue
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={locationAddress || ''}
              onChange={(e) =>
                onChange?.({
                  latitude,
                  longitude,
                  locationAddress: e.target.value,
                  googlePlaceId: googlePlaceId ?? null,
                })
              }
              placeholder="e.g. No. 45, Lotus Road, Colombo 01"
              disabled={disabled}
              className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2 text-xs text-[#1E293B]
                outline-none placeholder:text-[#94A3B8] transition
                ${error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-[#E8DDE4] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15'
                } disabled:opacity-50`}
            />
          </div>
          {error && <span className="text-xs text-rose-500 font-medium mt-1 block">{error}</span>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E293B] mb-1">
            Coordinates (GPS)
          </label>
          <div className="h-[34px] rounded-xl border border-[#E8DDE4] bg-[#FCF8FA] px-3 flex items-center justify-between text-[11px] text-[#475569]">
            {hasCoords ? (
              <span className="font-mono truncate">
                {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
              </span>
            ) : (
              <span className="text-[#94A3B8] italic">No coordinates set</span>
            )}
            {hasCoords && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Active GPS coords" />
            )}
          </div>
        </div>
      </div>

      {/* OpenStreetMap attribution note */}
      <p className="text-[10px] text-[#94A3B8] text-right">
        Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#8E406F]">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}
