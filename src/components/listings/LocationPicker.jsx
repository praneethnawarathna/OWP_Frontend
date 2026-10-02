// ============================================================
// LocationPicker.jsx
// Interactive Google Map location picker & address autocomplete
// for Oleena Wedding Planner listing creation/edit workflow.
// Includes Google Maps Autocomplete, Marker Dragging, Reverse
// Geocoding, Geolocation, Radius Overlay, and Manual Fallback.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
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
} from 'lucide-react';

const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
const DEFAULT_ZOOM_EMPTY = 7.5;
const DEFAULT_ZOOM_SELECTED = 15;
const THEME_COLOR = '#8E406F';

/**
 * Inner map controls & interaction layer (must be inside <APIProvider>)
 */
function MapInnerContent({
  latitude,
  longitude,
  locationAddress,
  googlePlaceId,
  radiusKm,
  onChange,
  onAddressInputFocus,
  onMapError,
}) {
  const map = useMap();
  const loadingStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const circleRef = useRef(null);

  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    !isNaN(Number(latitude)) &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(longitude));

  const markerPosition = hasCoords
    ? { lat: Number(latitude), lng: Number(longitude) }
    : null;

  // Track API loading status failure
  useEffect(() => {
    if (
      loadingStatus === APILoadingStatus.FAILED ||
      loadingStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      onMapError?.(loadingStatus);
    }
  }, [loadingStatus, onMapError]);

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!placesLib || !searchInputRef.current) return;

    try {
      const autocomplete = new placesLib.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'lk' },
        fields: ['geometry', 'formatted_address', 'name', 'place_id'],
      });

      autocompleteRef.current = autocomplete;

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addr = place.formatted_address || place.name || '';
        const placeId = place.place_id || '';

        if (searchInputRef.current) {
          searchInputRef.current.value = addr;
        }

        onChange({
          latitude: lat,
          longitude: lng,
          locationAddress: addr,
          googlePlaceId: placeId,
        });

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(DEFAULT_ZOOM_SELECTED);
        }
      });

      return () => {
        if (listener) {
          window.google?.maps?.event?.removeListener(listener);
        }
      };
    } catch (e) {
      console.warn('Google Places Autocomplete init warning:', e);
    }
  }, [placesLib, map, onChange]);

  // Keep search input text in sync when locationAddress changes externally
  useEffect(() => {
    if (searchInputRef.current && locationAddress !== undefined) {
      if (document.activeElement !== searchInputRef.current) {
        searchInputRef.current.value = locationAddress || '';
      }
    }
  }, [locationAddress]);

  // Reverse Geocoding helper
  const reverseGeocode = useCallback(
    (lat, lng) => {
      if (!window.google?.maps?.Geocoder) {
        onChange({
          latitude: lat,
          longitude: lng,
          locationAddress: locationAddress || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
          googlePlaceId: googlePlaceId || '',
        });
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const formatted = results[0].formatted_address;
          const pId = results[0].place_id || '';
          if (searchInputRef.current) {
            searchInputRef.current.value = formatted;
          }
          onChange({
            latitude: lat,
            longitude: lng,
            locationAddress: formatted,
            googlePlaceId: pId,
          });
        } else {
          onChange({
            latitude: lat,
            longitude: lng,
            locationAddress: locationAddress || `Selected Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            googlePlaceId: googlePlaceId || '',
          });
        }
      });
    },
    [locationAddress, googlePlaceId, onChange]
  );

  // Map Click handler: drop or move marker
  const handleMapClick = useCallback(
    (e) => {
      if (!e.detail?.latLng) return;
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Marker drag end handler
  const handleMarkerDragEnd = useCallback(
    (e) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Pan to marker on initial coordinate load if map ready
  useEffect(() => {
    if (map && markerPosition) {
      map.panTo(markerPosition);
    }
  }, [map, markerPosition?.lat, markerPosition?.lng]);

  // Service Radius Circle overlay
  useEffect(() => {
    if (!map || !window.google?.maps?.Circle) return;

    if (hasCoords && radiusKm && Number(radiusKm) > 0) {
      const radiusMeters = Number(radiusKm) * 1000;
      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
          strokeColor: THEME_COLOR,
          strokeOpacity: 0.7,
          strokeWeight: 2,
          fillColor: THEME_COLOR,
          fillOpacity: 0.12,
          map,
          center: markerPosition,
          radius: radiusMeters,
        });
      } else {
        circleRef.current.setMap(map);
        circleRef.current.setCenter(markerPosition);
        circleRef.current.setRadius(radiusMeters);
      }
    } else if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, hasCoords, markerPosition?.lat, markerPosition?.lng, radiusKm]);

  // "Use My Current Location" button
  const handleLocateMe = () => {
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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not retrieve your location.';
        if (err.code === 1) msg = 'Location permission was denied.';
        else if (err.code === 2) msg = 'Location is currently unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setGeoError(msg);
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full">
      {/* Search Bar & Fast Actions */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search venue, street address, landmark or city in Sri Lanka..."
            onFocus={onAddressInputFocus}
            className="w-full rounded-xl border border-[#E8DDE4] bg-white pl-10 pr-4 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition shadow-sm"
          />
        </div>

        <button
          type="button"
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
          <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {geoError && (
        <div className="mb-2 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 animate-fadeIn">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Google Map Viewport */}
      <div className="relative h-[340px] w-full rounded-2xl overflow-hidden border border-[#E8DDE4] shadow-inner bg-slate-100">
        <Map
          defaultCenter={markerPosition || SRI_LANKA_CENTER}
          defaultZoom={markerPosition ? DEFAULT_ZOOM_SELECTED : DEFAULT_ZOOM_EMPTY}
          onClick={handleMapClick}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              title={locationAddress || 'Service Location'}
            />
          )}
        </Map>

        {/* Map overlay helper pill */}
        <div className="absolute top-3 left-3 pointer-events-none bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#E8DDE4]/80 shadow-sm text-[11px] text-[#475569] flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#8E406F]" />
          <span>Click anywhere or drag pin to position exactly</span>
        </div>

        {/* Clear pin button */}
        {hasCoords && (
          <button
            type="button"
            onClick={() => {
              if (searchInputRef.current) searchInputRef.current.value = '';
              onChange({
                latitude: null,
                longitude: null,
                locationAddress: '',
                googlePlaceId: '',
              });
            }}
            className="absolute top-3 right-14 bg-white/95 hover:bg-white text-slate-700 hover:text-rose-600 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[11px] font-medium flex items-center gap-1 transition"
            title="Remove pinned location"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Pin</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Fallback Manual Location Entry when Google Maps API key is missing, billing inactive, or user toggles manual mode
 */
function ManualLocationFallback({
  latitude,
  longitude,
  locationAddress,
  onChange,
  error,
  reason = 'Google Maps interactive service is in manual entry mode.',
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 space-y-3.5">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900">
            Manual Location Mode Active
          </h4>
          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
            {reason} You can still enter your service address and coordinates directly below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Latitude (GPS Coordinate)
          </label>
          <input
            type="number"
            step="any"
            value={latitude ?? ''}
            onChange={(e) =>
              onChange({
                latitude: e.target.value !== '' ? parseFloat(e.target.value) : null,
                longitude,
                locationAddress,
                googlePlaceId: '',
              })
            }
            placeholder="e.g. 6.9271"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Longitude (GPS Coordinate)
          </label>
          <input
            type="number"
            step="any"
            value={longitude ?? ''}
            onChange={(e) =>
              onChange({
                latitude,
                longitude: e.target.value !== '' ? parseFloat(e.target.value) : null,
                locationAddress,
                googlePlaceId: '',
              })
            }
            placeholder="e.g. 79.8612"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main LocationPicker Component
 */
export default function LocationPicker({
  latitude,
  longitude,
  locationAddress,
  googlePlaceId,
  radiusKm = null,
  onChange,
  error,
  required = false,
  className = '',
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasApiKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_API_KEY');

  const [mapAuthFailed, setMapAuthFailed] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Detect Google Maps auth / billing failure callback
  useEffect(() => {
    const originalGmAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      setMapAuthFailed(true);
      if (typeof originalGmAuthFailure === 'function') {
        originalGmAuthFailure();
      }
    };
    return () => {
      window.gm_authFailure = originalGmAuthFailure;
    };
  }, []);

  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    !isNaN(Number(latitude)) &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(longitude));

  const handleFieldUpdate = (updates) => {
    onChange?.(updates);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#FAF0F5] border border-[#F1D7E6] flex items-center justify-center text-[#8E406F]">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-1.5">
              Service Location & Map Pin
              {required && <span className="text-rose-500 font-bold">*</span>}
            </h3>
            <p className="text-[11px] text-[#737373]">
              Pinpoint your physical venue address or base location for client distance matching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasCoords && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
              <Check className="h-3 w-3 text-emerald-600" />
              <span>Pin Placed</span>
            </div>
          )}

          {hasApiKey && (
            <button
              type="button"
              onClick={() => setManualMode((prev) => !prev)}
              className="text-[11px] font-medium text-[#8E406F] hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#FAF0F5] transition"
            >
              <Edit3 className="h-3 w-3" />
              <span>{manualMode ? 'Show Map' : 'Manual Coordinates'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Map or Fallback */}
      {!hasApiKey || manualMode ? (
        <ManualLocationFallback
          latitude={latitude}
          longitude={longitude}
          locationAddress={locationAddress}
          onChange={handleFieldUpdate}
          error={error}
          reason={
            !hasApiKey
              ? 'Google Maps API Key is not configured.'
              : 'Manual coordinates entry mode is enabled.'
          }
        />
      ) : (
        <div className="space-y-2">
          {mapAuthFailed && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Google Maps billing is pending activation. Map features are operating in fallback mode.</span>
              </div>
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="font-bold underline text-amber-900 ml-2 hover:text-amber-950 shrink-0"
              >
                Switch to Manual Inputs
              </button>
            </div>
          )}

          <APIProvider
            apiKey={apiKey}
            libraries={['places', 'geometry']}
            onError={() => setMapAuthFailed(true)}
          >
            <MapInnerContent
              latitude={latitude}
              longitude={longitude}
              locationAddress={locationAddress}
              googlePlaceId={googlePlaceId}
              radiusKm={radiusKm}
              onChange={handleFieldUpdate}
              onMapError={() => setMapAuthFailed(true)}
            />
          </APIProvider>
        </div>
      )}

      {/* Detailed Address Field & Coordinates Feedback */}
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
                handleFieldUpdate({
                  latitude,
                  longitude,
                  locationAddress: e.target.value,
                  googlePlaceId,
                })
              }
              placeholder="e.g. No. 45, Lotus Road, Colombo 01"
              className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2 text-xs text-[#1E293B] outline-none placeholder:text-[#94A3B8] transition ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-[#E8DDE4] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15'
              }`}
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
    </div>
  );
}
