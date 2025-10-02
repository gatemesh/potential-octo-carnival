/**
 * Step 3: Location Assignment (Farm > Zone > Field hierarchy)
 */

import React, { useState } from 'react';
import { GateMeshNode } from '@/types/agriculture';
import { useFarmStore } from '@/store/farmStore';
import { useAuthStore } from '@/store/authStore';
// import { MapSelector } from '@/components/Maps/MapSelector'; // Disabled - requires Google Maps API
import { MapPin, Plus, Building2, Layers, Square, Map } from 'lucide-react';

interface StepLocationAssignmentProps {
  node: GateMeshNode;
  updateNode: (updates: Partial<GateMeshNode>) => void;
}

export function StepLocationAssignment({ node, updateNode }: StepLocationAssignmentProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    farms,
    zones,
    fields,
    addFarm,
    addZone,
    addField,
    getZonesByFarm,
    getFieldsByZone,
  } = useFarmStore();

  const [selectedFarmId, setSelectedFarmId] = useState(node.farmId || '');
  const [selectedZoneId, setSelectedZoneId] = useState(node.zoneId || '');
  const [selectedFieldId, setSelectedFieldId] = useState(node.fieldId || '');
  const [userGivenName, setUserGivenName] = useState(node.userGivenName || '');

  const [showNewFarm, setShowNewFarm] = useState(false);
  const [showNewZone, setShowNewZone] = useState(false);
  const [showNewField, setShowNewField] = useState(false);

  const [newFarmName, setNewFarmName] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<'irrigation' | 'pasture' | 'crop' | 'building' | 'mixed'>('irrigation');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldAcres, setNewFieldAcres] = useState('');

  const userFarms = Array.from(farms.values()).filter(f =>
    currentUser?.farms.includes(f.id)
  );

  const availableZones = selectedFarmId ? getZonesByFarm(selectedFarmId) : [];
  const availableFields = selectedZoneId ? getFieldsByZone(selectedZoneId) : [];

  function handleFarmSelect(farmId: string) {
    setSelectedFarmId(farmId);
    setSelectedZoneId('');
    setSelectedFieldId('');
    updateNode({ farmId, zoneId: undefined, fieldId: undefined });
  }

  function handleZoneSelect(zoneId: string) {
    setSelectedZoneId(zoneId);
    setSelectedFieldId('');
    updateNode({ zoneId, fieldId: undefined });
  }

  function handleFieldSelect(fieldId: string) {
    setSelectedFieldId(fieldId);
    updateNode({ fieldId });
  }

  function handleNameChange(name: string) {
    setUserGivenName(name);
    updateNode({ userGivenName: name });
  }

  function handleCreateFarm() {
    if (!newFarmName.trim() || !currentUser) return;

    const farmId = addFarm({
      name: newFarmName,
      ownerId: currentUser.id,
    });

    handleFarmSelect(farmId);
    setNewFarmName('');
    setShowNewFarm(false);
  }

  function handleCreateZone() {
    if (!newZoneName.trim() || !selectedFarmId) return;

    const zoneId = addZone(selectedFarmId, {
      name: newZoneName,
      type: newZoneType,
    });

    handleZoneSelect(zoneId);
    setNewZoneName('');
    setNewZoneType('irrigation');
    setShowNewZone(false);
  }

  function handleCreateField() {
    if (!newFieldName.trim() || !selectedZoneId) return;

    const fieldId = addField(selectedZoneId, {
      name: newFieldName,
      acres: newFieldAcres ? parseFloat(newFieldAcres) : undefined,
      nodes: [],
    });

    handleFieldSelect(fieldId);
    setNewFieldName('');
    setNewFieldAcres('');
    setShowNewField(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Assign Location</h3>
        <p className="text-gray-600">
          Organize your node in the Farm → Zone → Field hierarchy for better management.
        </p>
      </div>

      {/* User-Given Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Node Name (Friendly Name)
        </label>
        <input
          type="text"
          value={userGivenName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., North Field Water Sensor"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Hardware ID: <span className="font-mono">{node.id}</span>
        </p>
      </div>

      {/* Farm Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4 inline mr-1" />
            Farm
          </label>
          <button
            onClick={() => setShowNewFarm(!showNewFarm)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <Plus className="w-4 h-4 inline" /> New Farm
          </button>
        </div>

        {showNewFarm && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
              placeholder="Farm name"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateFarm}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewFarm(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <select
          value={selectedFarmId}
          onChange={(e) => handleFarmSelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select a farm...</option>
          {userFarms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Zone Selection */}
      {selectedFarmId && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Layers className="w-4 h-4 inline mr-1" />
              Zone
            </label>
            <button
              onClick={() => setShowNewZone(!showNewZone)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <Plus className="w-4 h-4 inline" /> New Zone
            </button>
          </div>

          {showNewZone && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <input
                type="text"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Zone name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <select
                value={newZoneType}
                onChange={(e) => setNewZoneType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="irrigation">Irrigation</option>
                <option value="pasture">Pasture</option>
                <option value="crop">Crop</option>
                <option value="building">Building</option>
                <option value="mixed">Mixed Use</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateZone}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewZone(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <select
            value={selectedZoneId}
            onChange={(e) => handleZoneSelect(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a zone...</option>
            {availableZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Field Selection */}
      {selectedZoneId && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Square className="w-4 h-4 inline mr-1" />
              Field
            </label>
            <button
              onClick={() => setShowNewField(!showNewField)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <Plus className="w-4 h-4 inline" /> New Field
            </button>
          </div>

          {showNewField && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Field name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                value={newFieldAcres}
                onChange={(e) => setNewFieldAcres(e.target.value)}
                placeholder="Acres (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateField}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewField(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <select
            value={selectedFieldId}
            onChange={(e) => handleFieldSelect(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a field...</option>
            {availableFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name} {field.acres ? `(${field.acres} acres)` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Summary */}
      {(selectedFarmId || selectedZoneId || selectedFieldId) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">Location Hierarchy</p>
              <div className="text-sm text-green-800 space-y-1">
                {selectedFarmId && (
                  <p>📍 Farm: {farms.get(selectedFarmId)?.name}</p>
                )}
                {selectedZoneId && (
                  <p className="ml-4">└ Zone: {zones.get(selectedZoneId)?.name}</p>
                )}
                {selectedFieldId && (
                  <p className="ml-8">└ Field: {fields.get(selectedFieldId)?.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Coordinates Entry */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-5 h-5 text-gray-700" />
          <p className="text-sm font-medium text-gray-700">
            GPS Coordinates
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g., 40.7128"
              value={node.location?.lat || ''}
              onChange={(e) =>
                updateNode({
                  location: {
                    ...node.location,
                    lat: parseFloat(e.target.value) || 0,
                    lng: node.location?.lng || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g., -74.0060"
              value={node.location?.lng || ''}
              onChange={(e) =>
                updateNode({
                  location: {
                    ...node.location,
                    lat: node.location?.lat || 0,
                    lng: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {node.location?.lat && node.location?.lng && (
          <p className="mt-2 text-xs text-green-600">
            ✓ Location set: {node.location.lat.toFixed(6)}, {node.location.lng.toFixed(6)}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Note: Interactive map requires Google Maps API configuration
        </p>
      </div>
    </div>
  );
}
