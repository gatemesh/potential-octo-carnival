/**
 * Node Edit Modal
 */

import React, { useState } from 'react';
import { GateMeshNode, NodeCategory } from '@/types/agriculture';
import { X, Save, Edit2 } from 'lucide-react';

interface NodeEditModalProps {
  node: GateMeshNode;
  onClose: () => void;
  onSave: (updates: Partial<GateMeshNode>) => void;
}

export function NodeEditModal({ node, onClose, onSave }: NodeEditModalProps) {
  const [name, setName] = useState(node.name || node.userGivenName || '');
  const [category, setCategory] = useState(node.category || NodeCategory.SENSOR);
  const [lat, setLat] = useState(node.location?.lat || 0);
  const [lng, setLng] = useState(node.location?.lng || 0);

  function handleSave() {
    onSave({
      name,
      userGivenName: name,
      category,
      location: lat && lng ? { lat, lng } : node.location,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sage-100 rounded-lg">
              <Edit2 className="w-6 h-6 text-sage-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Node</h2>
              <p className="text-sm text-gray-600 mt-1 font-mono">{node.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Node Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., North Field Sensor"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NodeCategory)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
            >
              <option value={NodeCategory.SENSOR}>Sensor</option>
              <option value={NodeCategory.CONTROLLER}>Controller</option>
              <option value={NodeCategory.ACTUATOR}>Actuator</option>
              <option value={NodeCategory.GATEWAY}>Gateway</option>
              <option value={NodeCategory.RELAY}>Relay</option>
            </select>
          </div>

          {/* Hardware Info (Read-only) */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Hardware Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hardware Type:</span>
                <span className="text-gray-900 font-medium">{node.hardware || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mesh Role:</span>
                <span className="text-gray-900 font-medium capitalize">{node.meshRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium capitalize ${
                  node.status === 'active' ? 'text-green-600' :
                  node.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Coordinates
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  placeholder="40.7128"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  placeholder="-74.0060"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
