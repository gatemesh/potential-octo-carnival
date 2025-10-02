/**
 * Step 4: Advanced Configuration
 */

import React, { useState } from 'react';
import { GateMeshNode, NodeType, ConfigField, DetectedSensor } from '@/types/agriculture';
import { getNodeMetadata } from '@/data/nodeCatalog';
import { Settings, Gauge, Info } from 'lucide-react';

interface StepAdvancedConfigProps {
  node: GateMeshNode;
  updateNode: (updates: Partial<GateMeshNode>) => void;
}

export function StepAdvancedConfig({ node, updateNode }: StepAdvancedConfigProps) {
  const [showDetectedSensors, setShowDetectedSensors] = useState(true);

  // Get config fields for all assigned node types
  const allConfigFields: ConfigField[] = [];
  node.nodeTypes.forEach(typeId => {
    const metadata = getNodeMetadata(typeId);
    if (metadata?.configFields) {
      allConfigFields.push(...metadata.configFields);
    }
  });

  function handleConfigChange(key: string, value: any) {
    updateNode({
      config: {
        ...node.config,
        [key]: value,
      },
    });
  }

  function renderConfigField(field: ConfigField) {
    const currentValue = node.config[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.helpText}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
              min={field.min}
              max={field.max}
              step="any"
              placeholder={field.helpText}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {field.unit && (
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={currentValue || field.defaultValue || 50}
              onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value))}
              min={field.min || 0}
              max={field.max || 100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{field.min || 0}{field.unit}</span>
              <span className="font-semibold">{currentValue || field.defaultValue}{field.unit}</span>
              <span>{field.max || 100}{field.unit}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => handleConfigChange(field.key, e.target.checked)}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              {field.helpText || `Enable ${field.label}`}
            </span>
          </label>
        );

      default:
        return null;
    }
  }

  // Mock detected sensors (in real app, this would come from hardware)
  const mockDetectedSensors: DetectedSensor[] = [
    { type: 'Temperature', port: 'A0', name: 'DHT22', manufacturer: 'Aosong' },
    { type: 'Moisture', port: 'A1', name: 'Capacitive Soil Sensor', manufacturer: 'Generic' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Configuration</h3>
        <p className="text-gray-600">
          Fine-tune settings specific to your node's roles and detected sensors.
        </p>
      </div>

      {/* Detected Sensors */}
      {mockDetectedSensors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <button
            onClick={() => setShowDetectedSensors(!showDetectedSensors)}
            className="flex items-center gap-2 font-semibold text-blue-900 mb-2"
          >
            <Gauge className="w-5 h-5" />
            Auto-Detected Sensors ({mockDetectedSensors.length})
          </button>
          {showDetectedSensors && (
            <div className="space-y-2 mt-3">
              {mockDetectedSensors.map((sensor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
                  <div>
                    <p className="font-medium text-gray-900">{sensor.name}</p>
                    <p className="text-sm text-gray-600">
                      {sensor.type} • Port: {sensor.port}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Configuration Fields */}
      {allConfigFields.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Settings className="w-5 h-5" />
            <h4 className="font-semibold">Node Settings</h4>
          </div>

          {allConfigFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderConfigField(field)}
              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {field.helpText}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No additional configuration required for selected roles.</p>
        </div>
      )}

      {/* General Settings */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-4">General Settings</h4>
        <div className="space-y-4">
          {/* Reporting Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reporting Interval
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={node.config.reportingInterval || 300}
                onChange={(e) => handleConfigChange('reportingInterval', parseInt(e.target.value))}
                min={10}
                max={3600}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
                seconds
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">How often the node sends data</p>
          </div>

          {/* Sleep Mode */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={node.config.sleepMode || false}
                onChange={(e) => handleConfigChange('sleepMode', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable Sleep Mode</span>
                <p className="text-xs text-gray-500">Conserve battery when not reporting</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={node.notes || ''}
          onChange={(e) => updateNode({ notes: e.target.value })}
          placeholder="Add any installation notes, maintenance reminders, or other information..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
