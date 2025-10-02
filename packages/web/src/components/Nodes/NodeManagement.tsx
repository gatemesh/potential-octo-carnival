/**
 * Node Management Interface
 */

import React, { useState } from 'react';
import { useNodeStore } from '@/store/nodeStore';
import { GateMeshNode, NodeState } from '@/types/agriculture';
import { NodeEditModal } from './NodeEditModal';
import { NodeSettingsModal } from './NodeSettingsModal';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Settings,
  Signal,
  Battery,
  MapPin,
  Power,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function NodeManagement() {
  const { nodes, removeNode, updateNode, selectNode, selectedNodeId } = useNodeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | NodeState>('all');
  const [editingNode, setEditingNode] = useState<GateMeshNode | null>(null);
  const [settingsNode, setSettingsNode] = useState<GateMeshNode | null>(null);

  const nodesList = Array.from(nodes.values());

  // Filter nodes
  const filteredNodes = nodesList.filter((node) => {
    const matchesSearch =
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.name || node.userGivenName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || node.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  function getStatusIcon(status: string) {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getBatteryColor(battery: number) {
    if (battery > 60) return 'text-green-600';
    if (battery > 30) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getSignalColor(signal: number) {
    if (signal > -60) return 'text-green-600';
    if (signal > -75) return 'text-yellow-600';
    return 'text-red-600';
  }

  function handleDelete(nodeId: string) {
    if (confirm('Are you sure you want to delete this node? This action cannot be undone.')) {
      removeNode(nodeId);
    }
  }

  function handleEdit(node: GateMeshNode) {
    setEditingNode(node);
  }

  function handleSettings(node: GateMeshNode) {
    setSettingsNode(node);
  }

  function handleSaveEdit(nodeId: string, updates: Partial<GateMeshNode>) {
    updateNode(nodeId, updates);
    setEditingNode(null);
  }

  function handleSaveSettings(nodeId: string, updates: Partial<GateMeshNode>) {
    updateNode(nodeId, updates);
    setSettingsNode(null);
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editingNode && (
        <NodeEditModal
          node={editingNode}
          onClose={() => setEditingNode(null)}
          onSave={(updates) => handleSaveEdit(editingNode.id, updates)}
        />
      )}

      {/* Settings Modal */}
      {settingsNode && (
        <NodeSettingsModal
          node={settingsNode}
          onClose={() => setSettingsNode(null)}
          onSave={(updates) => handleSaveSettings(settingsNode.id, updates)}
        />
      )}
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search nodes by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{nodesList.length}</p>
            <p className="text-xs text-gray-600 mt-1">Total Nodes</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {nodesList.filter(n => n.status === 'active').length}
            </p>
            <p className="text-xs text-green-700 mt-1">Active</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">
              {nodesList.filter(n => n.status === 'warning').length}
            </p>
            <p className="text-xs text-yellow-700 mt-1">Warning</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">
              {nodesList.filter(n => n.status === 'offline').length}
            </p>
            <p className="text-xs text-red-700 mt-1">Offline</p>
          </div>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredNodes.length === 0 ? (
          <div className="p-12 text-center">
            <WifiOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No nodes found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'Try adjusting your search or filters' : 'Add a new node to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Node
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Signal
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNodes.map((node) => (
                  <tr
                    key={node.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedNodeId === node.id ? 'bg-sage-50' : ''
                    }`}
                    onClick={() => selectNode(node.id)}
                  >
                    {/* Node Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {node.name || node.userGivenName || 'Unnamed Node'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{node.id}</p>
                        {node.hardware && (
                          <p className="text-xs text-gray-400 mt-1">{node.hardware}</p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            node.status
                          )}`}
                        >
                          {node.status}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">
                          {node.category || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {node.meshRole || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      {node.location ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">
                            {node.location.farmId || node.location.name || 'Set'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>

                    {/* Battery */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${getBatteryColor(node.battery)}`} />
                        <span className={`text-sm font-medium ${getBatteryColor(node.battery)}`}>
                          {node.battery}%
                        </span>
                      </div>
                    </td>

                    {/* Signal */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Signal className={`w-4 h-4 ${getSignalColor(node.signal || node.rssi)}`} />
                        <span className={`text-sm font-medium ${getSignalColor(node.signal || node.rssi)}`}>
                          {node.signal || node.rssi} dBm
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(node);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit node"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSettings(node);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Node settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(node.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete node"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
