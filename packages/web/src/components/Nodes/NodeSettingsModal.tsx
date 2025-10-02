/**
 * Node Settings Modal
 */

import { useState, useEffect } from 'react';
import { GateMeshNode } from '@/types/agriculture';
import { X, Save, Settings as SettingsIcon, Zap, Activity, Info } from 'lucide-react';

interface NodeSettingsModalProps {
  node: GateMeshNode;
  onClose: () => void;
  onSave: (updates: Partial<GateMeshNode>) => void;
}

interface AdaptivePowerStatus {
  mode: string;
  enabled: boolean;
  current_power: number;
  base_power: number;
  min_power: number;
  max_power: number;
  avg_neighbor_rssi: number;
  neighbor_count: number;
  last_adjustment: number;
  next_adjustment: number;
}

export function NodeSettingsModal({ node, onClose, onSave }: NodeSettingsModalProps) {
  const [reportingInterval, setReportingInterval] = useState(node.config?.reportingInterval || 60);
  const [sleepMode, setSleepMode] = useState(node.config?.sleepMode || false);
  const [notes, setNotes] = useState(node.notes || '');
  const [adaptivePowerMode, setAdaptivePowerMode] = useState(0); // 0 = Off, 1 = Low, 2 = Medium, 3 = High, 4 = Max
  const [adaptivePowerStatus, setAdaptivePowerStatus] = useState<AdaptivePowerStatus | null>(null);
  const [isLoadingPowerStatus, setIsLoadingPowerStatus] = useState(false);

  const adaptivePowerModes = [
    { value: 0, label: 'Manual TX Power', description: 'Use fixed transmission power setting' },
    { value: 1, label: 'Low Power Saving', description: 'Conservative automatic power adjustment' },
    { value: 2, label: 'Medium Power Saving', description: 'Balanced power optimization' },
    { value: 3, label: 'High Power Saving', description: 'Aggressive power saving (recommended)' },
    { value: 4, label: 'Maximum Power Saving', description: 'Maximum battery conservation' }
  ];

  useEffect(() => {
    loadAdaptivePowerStatus();
  }, []);

  async function loadAdaptivePowerStatus() {
    setIsLoadingPowerStatus(true);
    try {
      // Use relative path so requests go through proxy server
      const response = await fetch(`/api/v1/adaptivepower/status`);
      if (response.ok) {
        const status = await response.json();
        setAdaptivePowerStatus(status);
        
        // Map status mode to our mode values
        const modeMap: { [key: string]: number } = {
          'Off': 0, 'Low': 1, 'Medium': 2, 'High': 3, 'Maximum': 4
        };
        setAdaptivePowerMode(modeMap[status.mode] || 0);
      }
    } catch (error) {
      console.warn('Could not load adaptive power status:', error);
    } finally {
      setIsLoadingPowerStatus(false);
    }
  }

  async function updateAdaptivePowerMode(newMode: number) {
    try {
      const response = await fetch(`/api/v1/adaptivepower/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `mode=${newMode}`
      });
      
      if (response.ok) {
        setAdaptivePowerMode(newMode);
        await loadAdaptivePowerStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Failed to update adaptive power mode:', error);
    }
  }

  async function forceRecalculatePower() {
    try {
      const response = await fetch(`/api/v1/adaptivepower/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'force_recalculate=1'
      });
      
      if (response.ok) {
        await loadAdaptivePowerStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Failed to force power recalculation:', error);
    }
  }

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
                {node.userGivenName || node.id}
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
                <p className="text-gray-900">{node.hardwareId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="text-gray-900 capitalize">{node.state}</p>
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

            {/* Adaptive Power Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-medium text-gray-900">Adaptive Power Control</h4>
                </div>
                {adaptivePowerStatus && (
                  <button
                    onClick={forceRecalculatePower}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    <Activity className="w-3 h-3 inline mr-1" />
                    Recalculate
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Power Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TX Power Mode
                  </label>
                  <select
                    value={adaptivePowerMode}
                    onChange={(e) => updateAdaptivePowerMode(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                  >
                    {adaptivePowerModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {adaptivePowerModes.find(m => m.value === adaptivePowerMode)?.description}
                  </p>
                </div>

                {/* Power Status Display */}
                {adaptivePowerStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-600 font-medium">Current Power</p>
                        <p className="text-blue-900">{adaptivePowerStatus.current_power} dBm</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Base Power</p>
                        <p className="text-blue-900">{adaptivePowerStatus.base_power} dBm</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Neighbors</p>
                        <p className="text-blue-900">{adaptivePowerStatus.neighbor_count} nodes</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Avg RSSI</p>
                        <p className="text-blue-900">
                          {adaptivePowerStatus.avg_neighbor_rssi > -999 
                            ? `${adaptivePowerStatus.avg_neighbor_rssi.toFixed(1)} dBm` 
                            : 'No data'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingPowerStatus && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">Loading power status...</p>
                  </div>
                )}

                {/* Info */}
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Adaptive Power Control adjusts transmission power every 4 hours based on neighbor signal strength within the GateMesh family.</p>
                    <p>Higher modes provide more aggressive power saving but may reduce range. Not active during irrigation events.</p>
                  </div>
                </div>
              </div>
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
