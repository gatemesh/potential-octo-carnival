/**
 * FieldBoundaryDrawer - Draw and edit field boundaries on map
 */

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, getMapOptions, isGoogleMapsConfigured } from '@/config/maps';
import { Square, Trash2, Save, AlertCircle } from 'lucide-react';

interface Boundary {
  lat: number;
  lng: number;
}

interface FieldBoundaryDrawerProps {
  // Existing boundary
  boundary?: Boundary[];

  // Callback when boundary changes
  onBoundaryChange?: (boundary: Boundary[]) => void;

  // Center of map
  center?: { lat: number; lng: number };

  // Field name for display
  fieldName?: string;
}

export function FieldBoundaryDrawer({
  boundary = [],
  onBoundaryChange,
  center = GOOGLE_MAPS_CONFIG.defaultCenter,
  fieldName = 'Field',
}: FieldBoundaryDrawerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries as any,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentBoundary, setCurrentBoundary] = useState<Boundary[]>(boundary);
  const [isDrawing, setIsDrawing] = useState(false);

  const mapOptions = getMapOptions('field');

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const coordinates: Boundary[] = [];

      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({
          lat: point.lat(),
          lng: point.lng(),
        });
      }

      setCurrentBoundary(coordinates);
      onBoundaryChange?.(coordinates);

      // Remove the polygon so user can draw a new one if needed
      polygon.setMap(null);
      setIsDrawing(false);
    },
    [onBoundaryChange]
  );

  const handleClearBoundary = () => {
    setCurrentBoundary([]);
    onBoundaryChange?.([]);
  };

  const calculateArea = (boundary: Boundary[]): number => {
    if (boundary.length < 3 || !window.google) return 0;

    const paths = boundary.map(
      (point) => new google.maps.LatLng(point.lat, point.lng)
    );

    const area = google.maps.geometry.spherical.computeArea(paths);
    // Convert from square meters to acres
    return area * 0.000247105;
  };

  const area = calculateArea(currentBoundary);

  if (!isGoogleMapsConfigured()) {
    return (
      <div className="w-full h-96 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <p className="text-amber-900">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  if (loadError || !isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">
          {loadError ? 'Failed to load map' : 'Loading map...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Square className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Draw {fieldName} Boundary
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentBoundary.length > 0 && (
            <button
              onClick={handleClearBoundary}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={() => setIsDrawing(true)}
            disabled={isDrawing}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            {currentBoundary.length > 0 ? 'Redraw' : 'Draw'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      {isDrawing && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Click on the map to draw the field boundary. Click on the first point to complete the polygon.
          </p>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={currentBoundary.length > 0 ? currentBoundary[0] : center}
          zoom={mapOptions.zoom}
          options={mapOptions}
          onLoad={onLoad}
        >
          {/* Existing boundary */}
          {currentBoundary.length > 0 && (
            <Polygon
              paths={currentBoundary}
              options={{
                fillColor: '#22c55e',
                fillOpacity: 0.3,
                strokeColor: '#16a34a',
                strokeOpacity: 1,
                strokeWeight: 2,
                editable: false,
                draggable: false,
              }}
            />
          )}

          {/* Drawing manager */}
          {isDrawing && (
            <DrawingManager
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: false,
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                polygonOptions: {
                  fillColor: '#22c55e',
                  fillOpacity: 0.3,
                  strokeColor: '#16a34a',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  editable: false,
                  draggable: false,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Boundary Info */}
      {currentBoundary.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">Boundary Defined</p>
              <p className="text-sm text-green-800 mt-1">
                {currentBoundary.length} points • {area.toFixed(2)} acres
              </p>
            </div>
            <Save className="w-6 h-6 text-green-600" />
          </div>
        </div>
      )}
    </div>
  );
}
