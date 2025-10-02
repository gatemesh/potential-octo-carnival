/**
 * IrrigationPathsDashboard - Main view for managing irrigation water paths
 */

import React, { useState } from 'react';
import { usePathStore } from '@/store/pathStore';
import { useFarmStore } from '@/store/farmStore';
import { WaterFlowVisualizer } from './WaterFlowVisualizer';
import { PathBuilder } from './PathBuilder';
import { Plus, Droplets, AlertCircle, Play, Square, Trash2, Edit } from 'lucide-react';

export function IrrigationPathsDashboard() {
  const paths = usePathStore((state) => Array.from(state.paths.values()));
  const { deletePath } = usePathStore();
  const farms = useFarmStore((state) => Array.from(state.farms.values()));

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(
    paths.length > 0 ? paths[0].id : null
  );

  const activePaths = paths.filter(p => p.isFlowing);
  const idlePaths = paths.filter(p => !p.isFlowing && p.status !== 'error');
  const errorPaths = paths.filter(p => p.status === 'error');

  function handleCreatePath() {
    setEditingPathId(null);
    setShowBuilder(true);
  }

  function handleEditPath(pathId: string) {
    setEditingPathId(pathId);
    setShowBuilder(true);
  }

  function handleDeletePath(pathId: string) {
    if (confirm('Are you sure you want to delete this irrigation path?')) {
      deletePath(pathId);
      if (selectedPathId === pathId) {
        setSelectedPathId(paths.length > 1 ? paths[0].id : null);
      }
    }
  }

  function handleSavePath(pathId: string) {
    setSelectedPathId(pathId);
  }

  const selectedPath = paths.find(p => p.id === selectedPathId);

  return (
    <div className="space-y-6">
      {/* Builder Modal */}
      {showBuilder && (
        <PathBuilder
          pathId={editingPathId || undefined}
          onClose={() => setShowBuilder(false)}
          onSave={handleSavePath}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Irrigation Paths</h2>
          <p className="text-sm text-gray-600 mt-1">
            Visualize and control water flow across your irrigation system
          </p>
        </div>
        <button
          onClick={handleCreatePath}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Path
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Droplets className="w-5 h-5" />
            <span className="text-sm font-medium">Total Paths</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{paths.length}</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Play className="w-5 h-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activePaths.length}</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Square className="w-5 h-5" />
            <span className="text-sm font-medium">Idle</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{idlePaths.length}</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Errors</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{errorPaths.length}</p>
        </div>
      </div>

      {paths.length === 0 ? (
        /* Empty State */
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center">
          <Droplets className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Irrigation Paths Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first irrigation path to visualize water flow from source to field.
            Define the route water takes through pumps, valves, and sensors.
          </p>
          <button
            onClick={handleCreatePath}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Path
          </button>

          {/* Example Paths */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900 mb-2">🌊 Simple Path</p>
              <p className="text-sm text-gray-600">Source → Valve → Field</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900 mb-2">⚙️ With Pump</p>
              <p className="text-sm text-gray-600">Source → Pump → Valve → Field</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900 mb-2">📊 Full System</p>
              <p className="text-sm text-gray-600">Source → Pump → Sensor → Valve → Field</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Path List */}
          <div className="col-span-3 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Paths ({paths.length})</h3>
            {paths.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedPathId(path.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedPathId === path.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900">{path.name}</p>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      path.isFlowing
                        ? 'bg-green-500 animate-pulse'
                        : path.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600">{path.nodes.length} nodes</p>
                {path.isFlowing && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    {path.totalFlowRate?.toFixed(0)} GPM
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPath(path.id);
                    }}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePath(path.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>

          {/* Visualizer */}
          <div className="col-span-9">
            {selectedPath ? (
              <WaterFlowVisualizer pathId={selectedPath.id} />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Select a path to visualize</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
