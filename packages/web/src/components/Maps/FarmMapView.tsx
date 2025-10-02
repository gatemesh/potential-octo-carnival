/**
 * FarmMapView - Overview map showing all nodes across the farm
 */

import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polygon } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, getMapOptions, isGoogleMapsConfigured } from '@/config/maps';
import { useNodeStore } from '@/store/nodeStore';
import { useFarmStore } from '@/store/farmStore';
import { GateMeshNode, NodeState } from '@/types/agriculture';
import { getNodeMetadata, CATEGORY_INFO } from '@/data/nodeCatalog';
import { MapPin, Wifi, WifiOff, Battery, AlertCircle } from 'lucide-react';

interface FarmMapViewProps {
  farmId?: string;
  onNodeClick?: (node: GateMeshNode) => void;
}

export function FarmMapView({ farmId, onNodeClick }: FarmMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries as any,
  });

  const nodes = useNodeStore((state) =>
    farmId
      ? state.getNodesByFarm(farmId)
      : Array.from(state.nodes.values())
  );

  const { fields } = useFarmStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const mapOptions = getMapOptions('farm');

  // Calculate center from nodes with locations
  const mapCenter = useMemo(() => {
    const nodesWithLocation = nodes.filter(
      (n) => n.location && n.location.lat !== 0 && n.location.lng !== 0
    );

    if (nodesWithLocation.length === 0) {
      return GOOGLE_MAPS_CONFIG.defaultCenter;
    }

    const avgLat =
      nodesWithLocation.reduce((sum, n) => sum + (n.location?.lat || 0), 0) /
      nodesWithLocation.length;
    const avgLng =
      nodesWithLocation.reduce((sum, n) => sum + (n.location?.lng || 0), 0) /
      nodesWithLocation.length;

    return { lat: avgLat, lng: avgLng };
  }, [nodes]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Get marker color based on node state
  function getMarkerColor(node: GateMeshNode): string {
    if (!node.isOnline) return 'red';
    if (node.state === NodeState.ERROR || node.state === NodeState.EMERGENCY_STOP)
      return 'orange';
    if (node.state === NodeState.ACTIVE || node.state === NodeState.WORKING) return 'green';
    return 'blue';
  }

  // Get marker icon URL
  function getMarkerIcon(node: GateMeshNode): string {
    const color = getMarkerColor(node);
    return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
  }

  // Get field boundaries
  const fieldBoundaries = useMemo(() => {
    if (!farmId) return [];
    return Array.from(fields.values())
      .filter((field) => field.boundary && field.boundary.length > 0)
      .map((field) => ({
        id: field.id,
        name: field.name,
        boundary: field.boundary!,
      }));
  }, [fields, farmId]);

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;

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
      <div className="w-full h-full bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">
          {loadError ? 'Failed to load map' : 'Loading map...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">Idle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-gray-600">Warning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">Offline</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={mapOptions.zoom}
          options={mapOptions}
          onLoad={onLoad}
        >
          {/* Field boundaries */}
          {fieldBoundaries.map((field) => (
            <Polygon
              key={field.id}
              paths={field.boundary}
              options={{
                fillColor: '#22c55e',
                fillOpacity: 0.15,
                strokeColor: '#16a34a',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          ))}

          {/* Node markers */}
          {nodes.map((node) => {
            if (!node.location || (node.location.lat === 0 && node.location.lng === 0)) {
              return null;
            }

            return (
              <Marker
                key={node.id}
                position={node.location}
                icon={getMarkerIcon(node)}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onNodeClick?.(node);
                }}
              >
                {selectedNodeId === node.id && selectedNode && (
                  <InfoWindow onCloseClick={() => setSelectedNodeId(null)}>
                    <div className="p-2 max-w-xs">
                      {/* Node Name */}
                      <h3 className="font-bold text-gray-900 mb-2">
                        {selectedNode.userGivenName || selectedNode.id}
                      </h3>

                      {/* Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {selectedNode.isOnline ? (
                          <Wifi className="w-4 h-4 text-green-600" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm text-gray-700">
                          {selectedNode.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>

                      {/* Battery */}
                      <div className="flex items-center gap-2 mb-2">
                        <Battery className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {selectedNode.battery}%
                        </span>
                      </div>

                      {/* Roles */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Roles:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.nodeTypes.map((typeId) => {
                            const metadata = getNodeMetadata(typeId);
                            return (
                              <span
                                key={typeId}
                                className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded"
                              >
                                {metadata?.name || 'Unknown'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {selectedNode.location.lat.toFixed(6)},{' '}
                          {selectedNode.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        </GoogleMap>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">Total Nodes</p>
          <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">Online</p>
          <p className="text-2xl font-bold text-green-600">
            {nodes.filter((n) => n.isOnline).length}
          </p>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">Fields</p>
          <p className="text-2xl font-bold text-gray-900">{fieldBoundaries.length}</p>
        </div>
      </div>
    </div>
  );
}
