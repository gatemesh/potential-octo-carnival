/**
 * MapSelector - Interactive map for selecting node locations
 */

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, getMapOptions, isGoogleMapsConfigured } from '@/config/maps';
import { MapPin, Satellite, Layers, AlertCircle } from 'lucide-react';

interface MapSelectorProps {
  // Current position
  position?: { lat: number; lng: number };

  // Callback when position changes
  onPositionChange?: (position: { lat: number; lng: number }) => void;

  // Existing markers to show
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    label: string;
    icon?: string;
  }>;

  // Map type
  mapType?: 'farm' | 'field' | 'node';

  // Enable/disable editing
  editable?: boolean;
}

export function MapSelector({
  position,
  onPositionChange,
  markers = [],
  mapType = 'node',
  editable = true,
}: MapSelectorProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries as any,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState(
    position || GOOGLE_MAPS_CONFIG.defaultCenter
  );

  const mapOptions = getMapOptions(mapType);

  // Update current position when prop changes
  useEffect(() => {
    if (position) {
      setCurrentPosition(position);
    }
  }, [position]);

  // Center map on position
  useEffect(() => {
    if (map && currentPosition) {
      map.panTo(currentPosition);
    }
  }, [map, currentPosition]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!editable || !e.latLng) return;

      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [editable, onPositionChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [onPositionChange]
  );

  // Get user's current location
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(newPos);
          onPositionChange?.(newPos);
          map?.panTo(newPos);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please click on the map instead.');
        }
      );
    }
  };

  // Check if Google Maps is configured
  if (!isGoogleMapsConfigured()) {
    return (
      <div className="w-full h-96 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-amber-900 mb-2">Google Maps Not Configured</h3>
          <p className="text-sm text-amber-800 mb-4">
            To use map-based location selection, you need to configure a Google Maps API key.
          </p>
          <div className="text-left bg-white p-4 rounded border border-amber-200">
            <p className="text-xs font-mono text-gray-700 mb-2">
              1. Get API key from:{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
            <p className="text-xs font-mono text-gray-700">
              2. Create <code className="bg-gray-100 px-1">.env</code> file with:
              <br />
              <code className="bg-gray-100 px-2 py-1 block mt-1">
                VITE_GOOGLE_MAPS_API_KEY=your_key
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-96 bg-red-50 border-2 border-red-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800">Failed to load Google Maps</p>
          <p className="text-sm text-red-600 mt-2">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Satellite className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>
            {editable ? 'Click on map to place marker' : 'View only'}
          </span>
        </div>
        <button
          onClick={handleUseMyLocation}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          <Satellite className="w-4 h-4" />
          Use My Location
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={currentPosition}
          zoom={mapOptions.zoom}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {/* Current position marker (editable) */}
          {editable && currentPosition && (
            <Marker
              position={currentPosition}
              draggable={editable}
              onDragEnd={handleMarkerDragEnd}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
            />
          )}

          {/* Existing markers (read-only) */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker.id)}
              icon={{
                url: marker.icon || 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            >
              {selectedMarker === marker.id && (
                <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                  <div className="p-2">
                    <p className="font-semibold text-gray-900">{marker.label}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {marker.position.lat.toFixed(6)}, {marker.position.lng.toFixed(6)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>

      {/* Coordinates Display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">Selected Location:</span>
        </div>
        <div className="font-mono text-sm text-gray-900">
          {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
        </div>
      </div>

      {/* Map Type Info */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Layers className="w-3 h-3" />
        <span>
          Use the map type controls (top-right) to switch between satellite, terrain, and road views
        </span>
      </div>
    </div>
  );
}
