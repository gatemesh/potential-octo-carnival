/**
 * PathBuilder - Create and edit irrigation water paths
 */

import React, { useState } from 'react';
import { usePathStore } from '@/store/pathStore';
import { useNodeStore } from '@/store/nodeStore';
import { useFarmStore } from '@/store/farmStore';
import { IrrigationPathNode, PathConnection, NodeType } from '@/types/agriculture';
import { Plus, Trash2, Link, Save, X, ArrowRight } from 'lucide-react';

interface PathBuilderProps {
  pathId?: string;
  onClose?: () => void;
  onSave?: (pathId: string) => void;
}

export function PathBuilder({ pathId, onClose, onSave }: PathBuilderProps) {
  const { paths, addPath, updatePath, addNodeToPath, addConnection, removeNodeFromPath, removeConnection } = usePathStore();
  const allNodes = useNodeStore((state) => Array.from(state.nodes.values()));
  const { farms } = useFarmStore();

  // Edit existing or create new
  const existingPath = pathId ? paths.get(pathId) : null;

  const [pathName, setPathName] = useState(existingPath?.name || '');
  const [pathDescription, setPathDescription] = useState(existingPath?.description || '');
  const [selectedFarmId, setSelectedFarmId] = useState(existingPath?.farmId || '');
  const [selectedNodes, setSelectedNodes] = useState<IrrigationPathNode[]>(existingPath?.nodes || []);
  const [connections, setConnections] = useState<PathConnection[]>(existingPath?.connections || []);

  // Filter irrigation nodes
  const irrigationNodes = allNodes.filter(node =>
    node.nodeTypes.some(type =>
      type >= 1 && type <= 59 // Irrigation category range
    )
  );

  // Available nodes (not already in path)
  const availableNodes = irrigationNodes.filter(
    node => !selectedNodes.find(pn => pn.nodeId === node.id)
  );

  function handleAddNode(nodeId: string) {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Determine node type based on its roles
    let pathNodeType: IrrigationPathNode['type'] = 'sensor';

    if (node.nodeTypes.includes(NodeType.HEADGATE_CONTROLLER)) {
      pathNodeType = 'source';
    } else if (node.nodeTypes.includes(NodeType.PUMP_CONTROLLER)) {
      pathNodeType = 'pump';
    } else if (
      node.nodeTypes.includes(NodeType.GATE_VALVE) ||
      node.nodeTypes.includes(NodeType.VARIABLE_VALVE)
    ) {
      pathNodeType = 'valve';
    } else if (
      node.nodeTypes.includes(NodeType.FLOW_SENSOR) ||
      node.nodeTypes.includes(NodeType.PRESSURE_SENSOR)
    ) {
      pathNodeType = 'sensor';
    } else if (node.nodeTypes.includes(NodeType.SECTION_CONTROLLER)) {
      pathNodeType = 'endpoint';
    }

    const newNode: IrrigationPathNode = {
      nodeId,
      order: selectedNodes.length,
      type: pathNodeType,
      status: node.isOnline ? 'ok' : 'offline',
      isActive: false,
    };

    setSelectedNodes([...selectedNodes, newNode]);

    // Auto-create connection if there's a previous node
    if (selectedNodes.length > 0) {
      const previousNode = selectedNodes[selectedNodes.length - 1];
      setConnections([
        ...connections,
        {
          from: previousNode.nodeId,
          to: nodeId,
          type: 'pipe',
          isFlowing: false,
        },
      ]);
    }
  }

  function handleRemoveNode(nodeId: string) {
    setSelectedNodes(selectedNodes.filter(n => n.nodeId !== nodeId));
    // Remove connections involving this node
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  }

  function handleMoveNode(nodeId: string, direction: 'up' | 'down') {
    const index = selectedNodes.findIndex(n => n.nodeId === nodeId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedNodes.length) return;

    const newNodes = [...selectedNodes];
    [newNodes[index], newNodes[newIndex]] = [newNodes[newIndex], newNodes[index]];

    // Update order
    newNodes.forEach((n, i) => (n.order = i));
    setSelectedNodes(newNodes);
  }

  function handleSave() {
    if (!pathName || selectedNodes.length < 2 || !selectedFarmId) {
      alert('Please provide a name, select at least 2 nodes, and choose a farm');
      return;
    }

    if (pathId) {
      // Update existing
      updatePath(pathId, {
        name: pathName,
        description: pathDescription,
        nodes: selectedNodes,
        connections,
      });
      onSave?.(pathId);
    } else {
      // Create new
      const newPathId = addPath({
        name: pathName,
        description: pathDescription,
        farmId: selectedFarmId,
        nodes: selectedNodes,
        connections,
        status: 'idle',
        isFlowing: false,
      });
      onSave?.(newPathId);
    }

    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pathId ? 'Edit' : 'Create'} Irrigation Path
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Define the water flow from source to destination
            </p>
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
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Path Name *
              </label>
              <input
                type="text"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                placeholder="e.g., North Field Main Line"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={pathDescription}
                onChange={(e) => setPathDescription(e.target.value)}
                placeholder="Additional notes about this irrigation path..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm *
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a farm...</option>
                {Array.from(farms.values()).map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Node Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Water Flow Path</h3>

            {/* Selected Nodes */}
            {selectedNodes.length > 0 && (
              <div className="mb-4 space-y-2">
                {selectedNodes.map((pathNode, index) => {
                  const node = allNodes.find(n => n.id === pathNode.nodeId);
                  return (
                    <div
                      key={pathNode.nodeId}
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {node?.userGivenName || node?.id || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {pathNode.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveNode(pathNode.nodeId, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveNode(pathNode.nodeId, 'down')}
                          disabled={index === selectedNodes.length - 1}
                          className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleRemoveNode(pathNode.nodeId)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {index < selectedNodes.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Node */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Node to Path
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddNode(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a node to add...</option>
                {availableNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.userGivenName || node.id} ({node.nodeTypes.length} roles)
                  </option>
                ))}
              </select>
            </div>

            {selectedNodes.length < 2 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                ℹ️ Add at least 2 nodes to create a water flow path. Typically: Source → Pump → Valve → Field
              </div>
            )}
          </div>

          {/* Connection Summary */}
          {connections.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Connections ({connections.length})
              </h3>
              <div className="space-y-2">
                {connections.map((conn, idx) => {
                  const fromNode = allNodes.find(n => n.id === conn.from);
                  const toNode = allNodes.find(n => n.id === conn.to);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      <Link className="w-4 h-4 text-gray-500" />
                      <span className="flex-1">
                        <strong>{fromNode?.userGivenName || fromNode?.id}</strong>
                        {' → '}
                        <strong>{toNode?.userGivenName || toNode?.id}</strong>
                      </span>
                      <span className="text-gray-600">{conn.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!pathName || selectedNodes.length < 2 || !selectedFarmId}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {pathId ? 'Update' : 'Create'} Path
          </button>
        </div>
      </div>
    </div>
  );
}
