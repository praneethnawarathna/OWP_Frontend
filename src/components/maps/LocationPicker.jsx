import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Crosshair,
  Building,
  Check,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { fixLeafletIcons } from './leafletIconFix';
import { searchPlace, reverseGeocode } from './searchPlace';
import { TILE_PROVIDERS } from './tileProviders';

// Fix missing marker icons in Vite
fixLeafletIcons();

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const THEME_COLOR = '#8E406F';
const NEUTRAL_BG = '#e5e3df';
const DEFAULT_ZOOM_EMPTY = 7;
const DEFAULT_ZOOM_SELECTED = 15;

// ─── Internal sub-components ─────────────────────────────────────────────────

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LocationPicker({
  latitude,
  longitude,
  locationAddress,
  googlePlaceId, // kept for back-compat
  radiusKm,
  onChange,
  error,
  required = false,
  readOnly = false,
  height = '340px',
}) {
  // ── Locate-me state
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // ── Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchMessage, setSearchMessage] = useState(null); // { text, type }
  const [searchSourceDev, setSearchSourceDev] = useState(null); // DEV only

  // ── Tile-provider fallback state
  const [providerIndex, setProviderIndex] = useState(0);
  const [allProvidersFailed, setAllProvidersFailed] = useState(false);
  const tileErrorsRef = useRef(0);
  const tileLoadsRef = useRef(0);
  const hasSwitchedRef = useRef(false);
  const providerStartTimeRef = useRef(Date.now());
  const fallbackTimerRef = useRef(null);

  // ── Refs
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  const hasCoords =
    typeof latitude === 'number' && !isNaN(latitude) &&
    typeof longitude === 'number' && !isNaN(longitude);

  const markerPosition = hasCoords ? { lat: latitude, lng: longitude } : null;
  const currentProvider =
    providerIndex < TILE_PROVIDERS.length ? TILE_PROVIDERS[providerIndex] : null;

  // ── Tile-provider auto-fallback
  const switchToNextProvider = useCallback(() => {
    setProviderIndex((prev) => {
      const next = prev + 1;
      if (next < TILE_PROVIDERS.length) {
        console.warn(
          `[LocationPicker] Tile provider switching: "${TILE_PROVIDERS[prev].name}" → "${TILE_PROVIDERS[next].name}"`
        );
        return next;
      }
      setAllProvidersFailed(true);
      return next;
    });
  }, []);

  useEffect(() => {
    tileErrorsRef.current = 0;
    tileLoadsRef.current = 0;
    hasSwitchedRef.current = false;
    providerStartTimeRef.current = Date.now();
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    if (providerIndex >= TILE_PROVIDERS.length) {
      setAllProvidersFailed(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasSwitchedRef.current && tileLoadsRef.current === 0 && tileErrorsRef.current >= 5) {
        hasSwitchedRef.current = true;
        switchToNextProvider();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [providerIndex, switchToNextProvider]);

  const handleTileLoad = useCallback(() => { tileLoadsRef.current += 1; }, []);
  const handleTileError = useCallback(() => {
    tileErrorsRef.current += 1;
    const elapsed = Date.now() - providerStartTimeRef.current;

    if (!hasSwitchedRef.current && tileLoadsRef.current === 0 && tileErrorsRef.current >= 5) {
      if (!fallbackTimerRef.current) {
        const delay = Math.min(2000, Math.max(0, 5000 - elapsed));
        fallbackTimerRef.current = setTimeout(() => {
          fallbackTimerRef.current = null;
          if (!hasSwitchedRef.current && tileLoadsRef.current === 0 && tileErrorsRef.current >= 5) {
            hasSwitchedRef.current = true;
            switchToNextProvider();
          }
        }, delay);
      }
    }
  }, [switchToNextProvider]);

  // ── Location update (pin drop, search select, locate-me)
  const handleLocationUpdate = useCallback(
    async (lat, lng, addressOverride = null) => {
      if (readOnly) return;

      let finalAddress = addressOverride;
      if (!finalAddress) {
        const addr = await reverseGeocode(lat, lng);
        finalAddress = addr || `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }

      onChange?.({
        latitude: lat,
        longitude: lng,
        locationAddress: finalAddress,
        googlePlaceId: '',
      });

      setSearchQuery('');
      setShowResults(false);
      setSearchMessage(null);
    },
    [onChange, readOnly]
  );

  // ── Marker drag
  const handleMarkerDragEnd = useCallback(
    (e) => {
      const pos = e.target.getLatLng();
      handleLocationUpdate(pos.lat, pos.lng);
    },
    [handleLocationUpdate]
  );

  // ── Locate Me (GPS)
  const handleLocateMe = () => {
    if (readOnly) return;
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setTimeout(() => setGeoError(null), 4000);
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        handleLocationUpdate(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        const msgs = {
          1: 'Location permission was denied.',
          2: 'Location is currently unavailable.',
          3: 'Location request timed out.',
        };
        setGeoError(msgs[err.code] || 'Could not retrieve your location.');
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── Address search (button / Enter only)
  const executeSearch = useCallback(async () => {
    if (!searchQuery.trim() || isSearching || readOnly) return;

    setIsSearching(true);
    setSearchMessage(null);
    setShowResults(false);
    setSearchSourceDev(null);

    try {
      const { results, sourceUsed, usedFallback } = await searchPlace(searchQuery);

      setSearchSourceDev(sourceUsed);

      if (results.length === 0) {
        setSearchResults([]);
        setSearchMessage({
          text: `No places found for "${searchQuery}". Try a nearby town or drop the pin on the map.`,
          type: 'info',
        });
        return;
      }

      if (usedFallback && sourceUsed === 'built-in') {
        setSearchMessage({
          text: 'Search service is slow or unavailable. Showing built-in town matches.',
          type: 'warn',
        });
      }

      setSearchResults(results);
      setShowResults(true);

      // Auto-select if single result
      if (results.length === 1) {
        handleResultSelect(results[0]);
      }
    } catch (err) {
      console.error('[LocationPicker] Search failed:', err);
      setSearchMessage({
        text: 'Search service is slow or unavailable. Showing built-in town matches.',
        type: 'warn',
      });
    } finally {
      setIsSearching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isSearching, readOnly]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); executeSearch(); }
    if (e.key === 'Escape') { setShowResults(false); setSearchResults([]); }
  };

  // ── Result select (move pin + zoom)
  const handleResultSelect = (result) => {
    setShowResults(false);
    setSearchResults([]);
    setSearchMessage(null);
    // Approximate town results zoom to 13, precise results to 15
    const zoom = result.source === 'built-in' ? 13 : DEFAULT_ZOOM_SELECTED;
    const label = result.label;
    onChange?.({
      latitude: result.lat,
      longitude: result.lng,
      locationAddress: label,
      googlePlaceId: '',
      _zoom: zoom,
    });
    setSearchQuery('');
  };

  // ── Reset pin
  const handleResetPin = () => {
    if (readOnly) return;
    onChange?.({ latitude: null, longitude: null, locationAddress: '', googlePlaceId: '' });
    setSearchQuery('');
    setSearchMessage(null);
  };

  // ── Direct coordinate inputs
  const handleLatChange = (e) => {
    if (readOnly) return;
    const newLat = parseFloat(e.target.value);
    if (!isNaN(newLat)) {
      const currentLng = hasCoords ? longitude : SRI_LANKA_CENTER[1];
      handleLocationUpdate(newLat, currentLng);
    }
  };

  const handleLngChange = (e) => {
    if (readOnly) return;
    const newLng = parseFloat(e.target.value);
    if (!isNaN(newLng)) {
      const currentLat = hasCoords ? latitude : SRI_LANKA_CENTER[0];
      handleLocationUpdate(currentLat, newLng);
    }
  };

  // ── Close results on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    if (showResults) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showResults]);

  // Derive map center and zoom, including result-selected zoom
  const mapCenter = hasCoords
    ? { lat: latitude, lng: longitude }
    : { lat: SRI_LANKA_CENTER[0], lng: SRI_LANKA_CENTER[1] };

  const mapZoom = hasCoords ? DEFAULT_ZOOM_SELECTED : DEFAULT_ZOOM_EMPTY;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full">
      <style>{`.leaflet-container { background-color: ${NEUTRAL_BG} !important; }`}</style>

      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#FAF0F5] text-[#8E406F] flex items-center justify-center shrink-0">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1E293B] mb-0.5">
              Service Location &amp; Map Pin
              {required && <span className="text-rose-500 font-bold ml-1">*</span>}
            </h3>
            <p className="text-[11px] text-[#737373]">
              Pinpoint your physical venue address or base location for client distance matching.
            </p>
          </div>
        </div>

        {hasCoords && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <Check className="h-3 w-3 text-emerald-600" />
            <span>Pin Placed</span>
          </div>
        )}
      </div>

      {/* Search row */}
      {!readOnly && (
        <div className="mb-1 relative" ref={resultsRef}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type address and press Enter or Search..."
                className="w-full rounded-xl border border-[#E8DDE4] bg-white pl-10 pr-24 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition shadow-sm"
              />
              <button
                id="location-search-btn"
                onClick={executeSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#8E406F] text-white text-xs font-semibold rounded-lg hover:bg-[#723259] transition disabled:opacity-50 flex items-center gap-1"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>…</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>

            <button
              type="button"
              id="locate-me-btn"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8DDE4] bg-white hover:bg-[#FAF5F8] text-[#8E406F] text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60 shrink-0"
              title="Use GPS to set location"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8E406F]" />
              ) : (
                <Crosshair className="h-4 w-4 text-[#8E406F]" />
              )}
              <span>{isLocating ? 'Locating…' : 'Locate Me'}</span>
            </button>
          </div>

          {/* DEV search-source caption */}
          {import.meta.env.DEV && searchSourceDev && (
            <p className="mt-1 text-[11px] text-slate-400 font-mono">
              Search source: {searchSourceDev}
            </p>
          )}

          {/* Search message (info / warn) */}
          {searchMessage && !showResults && (
            <div
              className={`mt-2 flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                searchMessage.type === 'warn'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              {searchMessage.type === 'warn' && (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              )}
              <span>{searchMessage.text}</span>
            </div>
          )}

          {/* Results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleResultSelect(res)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-xs text-slate-700 transition"
                >
                  {res.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setShowResults(false); setSearchResults([]); }}
                className="w-full px-4 py-2 text-center text-xs text-[#8E406F] font-semibold cursor-pointer hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Geo-error banner */}
      {geoError && (
        <div className="mb-2 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map viewport */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[#E8DDE4] shadow-inner z-0 mt-3"
        style={{ height, backgroundColor: NEUTRAL_BG }}
      >
        {/* Offline banner */}
        {allProvidersFailed && (
          <div className="absolute top-3 left-3 right-3 z-[1000] p-3 rounded-xl bg-amber-500/95 text-white shadow-lg backdrop-blur-sm border border-amber-600 text-xs flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-medium leading-relaxed">
              Map pictures can't be loaded on this network. You can still set the location using the coordinates below.
            </span>
          </div>
        )}

        <MapContainer
          center={SRI_LANKA_CENTER}
          zoom={DEFAULT_ZOOM_EMPTY}
          scrollWheelZoom={true}
          maxZoom={19}
          style={{ width: '100%', height: '100%', backgroundColor: NEUTRAL_BG }}
        >
          <MapInvalidator />

          {currentProvider && !allProvidersFailed && (
            <TileLayer
              key={currentProvider.id}
              url={currentProvider.url}
              attribution={currentProvider.attribution}
              subdomains={currentProvider.subdomains || 'abc'}
              maxZoom={currentProvider.maxZoom || 19}
              eventHandlers={{ tileload: handleTileLoad, tileerror: handleTileError }}
            />
          )}

          <MapRecenter center={mapCenter} zoom={mapZoom} />

          {!readOnly && <MapClickHandler onLocationSelected={handleLocationUpdate} />}

          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={!readOnly}
              eventHandlers={{ dragend: handleMarkerDragEnd }}
            />
          )}

          {hasCoords && radiusKm && Number(radiusKm) > 0 && (
            <Circle
              center={markerPosition}
              radius={Number(radiusKm) * 1000}
              pathOptions={{ color: THEME_COLOR, fillColor: THEME_COLOR, fillOpacity: 0.12, weight: 2 }}
            />
          )}
        </MapContainer>

        {/* "Click to pin" helper */}
        {!readOnly && !allProvidersFailed && (
          <div className="absolute top-3 left-3 z-[400] pointer-events-none bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#E8DDE4]/80 shadow-sm text-[11px] text-[#475569] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#8E406F]" />
            <span>Click anywhere or drag pin to position exactly</span>
          </div>
        )}

        {/* Reset pin */}
        {hasCoords && !readOnly && (
          <button
            type="button"
            id="reset-pin-btn"
            onClick={handleResetPin}
            className="absolute top-3 right-3 z-[400] bg-white/95 hover:bg-white text-slate-700 hover:text-rose-600 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[11px] font-medium flex items-center gap-1 transition"
            title="Remove pinned location"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Pin</span>
          </button>
        )}
      </div>

      {/* DEV map-source caption */}
      {import.meta.env.DEV && (
        <div className="text-[11px] text-slate-500 mt-1.5 font-mono">
          Map source: {allProvidersFailed ? 'None (all providers failed)' : (currentProvider?.name || 'Unknown')}
        </div>
      )}

      {/* Coordinate inputs & Google Maps link */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <label htmlFor="coord-lat" className="font-semibold text-slate-600 text-xs">Latitude:</label>
            <input
              id="coord-lat"
              type="number"
              step="any"
              disabled={readOnly}
              value={latitude ?? ''}
              onChange={handleLatChange}
              placeholder="e.g. 6.9271"
              className="w-28 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]/20 disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label htmlFor="coord-lng" className="font-semibold text-slate-600 text-xs">Longitude:</label>
            <input
              id="coord-lng"
              type="number"
              step="any"
              disabled={readOnly}
              value={longitude ?? ''}
              onChange={handleLngChange}
              placeholder="e.g. 79.8612"
              className="w-28 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 outline-none focus:border-[#8E406F] focus:ring-1 focus:ring-[#8E406F]/20 disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>
        </div>

        <a
          href={hasCoords ? `https://www.google.com/maps?q=${latitude},${longitude}` : 'https://www.google.com/maps'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E406F] hover:text-[#723259] hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* Address field & GPS badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#1E293B] mb-1">
            Confirmed Location Address / Venue
            {required && !readOnly && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={locationAddress || ''}
              readOnly={readOnly}
              onChange={(e) => {
                if (readOnly) return;
                onChange?.({ latitude, longitude, locationAddress: e.target.value, googlePlaceId: '' });
              }}
              placeholder="e.g. No. 45, Lotus Road, Colombo 01"
              className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2 text-xs text-[#1E293B] outline-none placeholder:text-[#94A3B8] transition ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-[#E8DDE4] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15'
              } ${readOnly ? 'bg-slate-50 cursor-not-allowed opacity-80' : ''}`}
            />
          </div>
          {error && <span className="text-xs text-rose-500 font-medium mt-1 block">{error}</span>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E293B] mb-1">Coordinates (GPS)</label>
          <div className="h-[34px] rounded-xl border border-[#E8DDE4] bg-[#FCF8FA] px-3 flex items-center justify-between text-[11px] text-[#475569]">
            {hasCoords ? (
              <span className="font-mono truncate">
                {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
              </span>
            ) : (
              <span className="text-[#94A3B8] italic">No coordinates set</span>
            )}
            {hasCoords && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Active GPS coords" />}
          </div>
        </div>
      </div>
    </div>
  );
}
