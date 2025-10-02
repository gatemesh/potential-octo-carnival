/**
 * Step 1: Role Selection with Category Cards
 */

import React, { useState } from 'react';
import { GateMeshNode, NodeType, NodeCategory } from '@/types/agriculture';
import { NODE_CATALOG, CATEGORY_INFO, getNodesByCategory } from '@/data/nodeCatalog';
import {
  Droplet,
  Wheat,
  Cog,
  Home,
  Leaf,
  Star,
  Package,
  Plus,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';

interface StepRoleSelectionProps {
  node: GateMeshNode;
  updateNode: (updates: Partial<GateMeshNode>) => void;
}

const CATEGORY_ICONS: Record<NodeCategory, any> = {
  [NodeCategory.IRRIGATION]: Droplet,
  [NodeCategory.CROP]: Wheat,
  [NodeCategory.EQUIPMENT]: Cog,
  [NodeCategory.BUILDING]: Home,
  [NodeCategory.LIVESTOCK]: Leaf,
  [NodeCategory.SPECIALIZED]: Star,
  [NodeCategory.PROCESSING]: Package,
};

export function StepRoleSelection({ node, updateNode }: StepRoleSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<NodeCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<NodeType[]>(
    node.nodeTypes.filter(t => t !== NodeType.UNDEFINED)
  );

  function handleCategorySelect(category: NodeCategory) {
    setSelectedCategory(category);
    setSearchQuery('');
  }

  function handleRoleToggle(role: NodeType) {
    let newRoles: NodeType[];
    if (selectedRoles.includes(role)) {
      newRoles = selectedRoles.filter(r => r !== role);
    } else {
      newRoles = [...selectedRoles, role];
    }
    setSelectedRoles(newRoles);
    updateNode({ nodeTypes: newRoles.length > 0 ? newRoles : [NodeType.UNDEFINED] });
  }

  function handleBack() {
    setSelectedCategory(null);
    setSearchQuery('');
  }

  const categories = Object.entries(CATEGORY_INFO);
  const filteredNodes = selectedCategory
    ? getNodesByCategory(selectedCategory).filter(n =>
        searchQuery
          ? n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {selectedCategory ? 'Select Node Roles' : 'Choose Category'}
        </h3>
        <p className="text-gray-600">
          {selectedCategory
            ? 'Select one or more roles for this node. Multi-role nodes can perform multiple functions.'
            : 'Start by selecting the category that best matches your node\'s primary purpose.'}
        </p>
      </div>

      {/* Selected Roles Badge */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm font-semibold text-green-900">Selected Roles:</span>
          {selectedRoles.map(roleType => {
            const roleInfo = NODE_CATALOG.find(n => n.id === roleType);
            return (
              <div
                key={roleType}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm"
              >
                <span>{roleInfo?.name || 'Unknown'}</span>
                <button
                  onClick={() => handleRoleToggle(roleType)}
                  className="hover:bg-green-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(([key, info]) => {
            const Icon = CATEGORY_ICONS[key as NodeCategory];
            const nodeCount = getNodesByCategory(key as NodeCategory).length;

            return (
              <button
                key={key}
                onClick={() => handleCategorySelect(key as NodeCategory)}
                className="group relative p-6 bg-white border-2 border-gray-200 hover:border-green-500 rounded-xl transition-all hover:shadow-lg text-left"
                style={{
                  borderColor: `${info.color}20`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${info.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: info.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-green-600 mb-1">
                      {info.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                    <span className="text-xs text-gray-500">{nodeCount} node types</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Node Type Selection */}
      {selectedCategory && (
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
          >
            ← Back to Categories
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node types..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Node Type Cards */}
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {filteredNodes.map((nodeInfo) => {
              const isSelected = selectedRoles.includes(nodeInfo.id);

              return (
                <button
                  key={nodeInfo.id}
                  onClick={() => handleRoleToggle(nodeInfo.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isSelected ? (
                        <Plus className="w-5 h-5 rotate-45" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{nodeInfo.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{nodeInfo.description}</p>
                      {nodeInfo.capabilities && nodeInfo.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {nodeInfo.capabilities.slice(0, 3).map((cap, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {cap}
                            </span>
                          ))}
                          {nodeInfo.capabilities.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              +{nodeInfo.capabilities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredNodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No node types found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {selectedRoles.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            💡 <strong>Tip:</strong> You can assign multiple roles to a single node. For example, a node can be both a Weather Station and a Soil Moisture Sensor.
          </p>
        </div>
      )}
    </div>
  );
}
