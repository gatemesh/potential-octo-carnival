/**
 * Node Settings Modal
 */

import React, { useState } from 'react';
import { GateMeshNode } from '@/types/agriculture';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';

interface NodeSettingsModalProps {
  node: GateMeshNode;
  onClose: () => void;
  onSave: (updates: Partial<GateMeshNode>) => void;
}

export function NodeSettingsModal({ node, onClose, onSave }: NodeSettingsModalProps) {
  const [reportingInterval, setReportingInterval] = useState(node.config?.reportingInterval || 60);
  const [sleepMode, setSleepMode] = useState(node.config?.sleepMode || false);
  const [notes, setNotes] = useState(node.notes || '');

  function handleSave() {
    onSave({
      config: {
        ...node.config,
        reportingInterval,
        sleepMode,
      },
      notes,
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
              <SettingsIcon className="w-6 h-6 text-sage-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Node Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                {node.name || node.userGivenName || node.id}
              </p>
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
          {/* Hardware Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Hardware Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Hardware ID</p>
                <p className="font-mono text-gray-900">{node.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Hardware Type</p>
                <p className="text-gray-900">{node.hardware || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="text-gray-900 capitalize">{node.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Mesh Role</p>
                <p className="text-gray-900 capitalize">{node.meshRole}</p>
              </div>
            </div>
          </div>

          {/* Configuration Settings */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>

            {/* Reporting Interval */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="3600"
                value={reportingInterval}
                onChange={(e) => setReportingInterval(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How often the node reports data (10-3600 seconds)
              </p>
            </div>

            {/* Sleep Mode */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sleepMode}
                  onChange={(e) => setSleepMode(e.target.checked)}
                  className="w-5 h-5 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Sleep Mode</span>
                  <p className="text-xs text-gray-500">Conserve battery by sleeping between reports</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this node..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
            />
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
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
