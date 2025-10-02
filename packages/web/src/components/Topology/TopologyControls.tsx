import React from 'react';
import { TopologyLayout, TopologyFilter, NodeCategory } from '@/types/agriculture';

interface TopologyControlsProps {
  layout: TopologyLayout;
  onLayoutChange: (layout: TopologyLayout) => void;
  filter: TopologyFilter;
  onFilterChange: (filter: TopologyFilter) => void;
}

export const TopologyControls: React.FC<TopologyControlsProps> = ({
  layout,
  onLayoutChange,
  filter,
  onFilterChange,
}) => {
  const layouts: { value: TopologyLayout; label: string; description: string }[] = [
    { value: 'force', label: 'Force', description: 'Auto-organized layout' },
    { value: 'hierarchical', label: 'Hierarchical', description: 'By mesh role' },
    { value: 'circular', label: 'Circular', description: 'Ring layout' },
    { value: 'geographic', label: 'Geographic', description: 'By GPS location' },
  ];

  const categories = [
    { value: NodeCategory.IRRIGATION, label: 'Irrigation' },
    { value: NodeCategory.LIVESTOCK, label: 'Livestock' },
    { value: NodeCategory.EQUIPMENT, label: 'Equipment' },
    { value: NodeCategory.BUILDING, label: 'Building' },
    { value: NodeCategory.CROP, label: 'Crop' },
    { value: NodeCategory.SPECIALIZED, label: 'Specialized' },
    { value: NodeCategory.PROCESSING, label: 'Processing' },
  ];

  const statuses = [
    { value: 'online' as const, label: 'Online', color: 'text-green-600' },
    { value: 'offline' as const, label: 'Offline', color: 'text-gray-600' },
    { value: 'warning' as const, label: 'Warning', color: 'text-amber-600' },
  ];

  const meshRoles = [
    { value: 'coordinator' as const, label: 'Coordinator', color: 'text-violet-600' },
    { value: 'router' as const, label: 'Router', color: 'text-blue-600' },
    { value: 'client' as const, label: 'Client', color: 'text-green-600' },
  ];

  const toggleCategory = (category: NodeCategory) => {
    const current = filter.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFilterChange({ ...filter, categories: updated.length > 0 ? updated : undefined });
  };

  const toggleStatus = (status: 'online' | 'offline' | 'warning') => {
    const current = filter.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFilterChange({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const toggleMeshRole = (role: 'coordinator' | 'router' | 'client') => {
    const current = filter.meshRole || [];
    const updated = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    onFilterChange({ ...filter, meshRole: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    (filter.categories && filter.categories.length > 0) ||
    (filter.status && filter.status.length > 0) ||
    (filter.meshRole && filter.meshRole.length > 0) ||
    filter.minSignalStrength !== undefined;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Controls</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Layout Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <div className="grid grid-cols-2 gap-2">
            {layouts.map(l => (
              <button
                key={l.value}
                onClick={() => onLayoutChange(l.value)}
                className={`p-3 rounded-lg border-2 transition-colors text-left ${
                  layout === l.value
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{l.label}</div>
                <div className="text-xs text-gray-600">{l.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const isActive = filter.categories?.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => {
              const isActive = filter.status?.includes(status.value);
              return (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={isActive ? '' : status.color}>{status.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mesh Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesh Role
          </label>
          <div className="flex flex-wrap gap-2">
            {meshRoles.map(role => {
              const isActive = filter.meshRole?.includes(role.value);
              return (
                <button
                  key={role.value}
                  onClick={() => toggleMeshRole(role.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={isActive ? '' : role.color}>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Signal Strength Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Signal Strength
          </label>
          <input
            type="range"
            min="-90"
            max="-40"
            step="5"
            value={filter.minSignalStrength || -90}
            onChange={e => {
              const value = parseInt(e.target.value);
              onFilterChange({
                ...filter,
                minSignalStrength: value === -90 ? undefined : value,
              });
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Poor (-90 dBm)</span>
            <span className="font-medium">
              {filter.minSignalStrength ? `${filter.minSignalStrength} dBm` : 'All'}
            </span>
            <span>Excellent (-40 dBm)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
