/**
 * Step 5: Review Configuration
 */

import React from 'react';
import { GateMeshNode } from '@/types/agriculture';
import { getNodeMetadata, CATEGORY_INFO } from '@/data/nodeCatalog';
import { useFarmStore } from '@/store/farmStore';
import { CheckCircle2, Radio, MapPin, Settings, Tag } from 'lucide-react';

interface StepReviewProps {
  node: GateMeshNode;
  updateNode: (updates: Partial<GateMeshNode>) => void;
}

const MESH_ROLE_NAMES: Record<number, string> = {
  0: 'Client',
  1: 'Client (Mute)',
  2: 'Router',
  3: 'Router + Client',
  4: 'Repeater',
  5: 'Tracker',
  6: 'Sensor',
  7: 'TAK',
  8: 'Client (Hidden)',
  9: 'Lost & Found',
  10: 'TAK Tracker',
};

export function StepReview({ node }: StepReviewProps) {
  const { farms, zones, fields } = useFarmStore();

  const farm = node.farmId ? farms.get(node.farmId) : null;
  const zone = node.zoneId ? zones.get(node.zoneId) : null;
  const field = node.fieldId ? fields.get(node.fieldId) : null;

  // Get role names
  const roleNames = node.nodeTypes
    .filter(t => t !== 0)
    .map(typeId => {
      const metadata = getNodeMetadata(typeId);
      return metadata?.name || 'Unknown';
    });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Configuration</h3>
        <p className="text-gray-600">
          Please review your node configuration before completing setup.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="space-y-4">
        {/* Identity */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Identity</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hardware ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{node.id}</span>
                </div>
                {node.userGivenName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Display Name:</span>
                    <span className="font-semibold text-gray-900">{node.userGivenName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Firmware:</span>
                  <span className="text-gray-900">{node.firmwareVersion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Assigned Roles</h4>
              {roleNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roleNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No roles assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Network Configuration</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mesh Role:</span>
                  <span className="font-semibold text-gray-900">
                    {MESH_ROLE_NAMES[node.meshRole]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signal Strength:</span>
                  <span className="text-gray-900">{node.rssi} dBm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
              {farm || zone || field ? (
                <div className="space-y-1 text-sm">
                  {farm && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📍 Farm:</span>
                      <span className="font-semibold text-gray-900">{farm.name}</span>
                    </div>
                  )}
                  {zone && (
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-gray-600">└ Zone:</span>
                      <span className="font-semibold text-gray-900">
                        {zone.name} <span className="text-gray-500">({zone.type})</span>
                      </span>
                    </div>
                  )}
                  {field && (
                    <div className="flex items-center gap-2 ml-8">
                      <span className="text-gray-600">└ Field:</span>
                      <span className="font-semibold text-gray-900">
                        {field.name}
                        {field.acres && <span className="text-gray-500"> ({field.acres} acres)</span>}
                      </span>
                    </div>
                  )}
                  {node.location && (node.location.lat !== 0 || node.location.lng !== 0) && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-600">GPS:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {node.location.lat.toFixed(6)}, {node.location.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No location assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Configuration */}
        {Object.keys(node.config).length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Advanced Settings</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(node.config).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-600 text-xs">{key}:</span>
                  <span className="font-semibold text-gray-900">
                    {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {node.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Notes</h4>
            <p className="text-sm text-gray-700">{node.notes}</p>
          </div>
        )}
      </div>

      {/* Ready Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h4 className="font-bold text-gray-900 text-lg mb-2">Ready to Deploy!</h4>
        <p className="text-gray-700">
          Click <strong>Complete</strong> to finish setup. Your node will be registered and ready for installation.
        </p>
      </div>
    </div>
  );
}
