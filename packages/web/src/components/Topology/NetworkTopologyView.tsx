import React, { useState, useMemo } from 'react';
import { NetworkNode, MeshConnection, TopologyLayout, TopologyFilter } from '@/types/agriculture';
import { useNodeStore } from '@/store/nodeStore';
import { TopologyControls } from './TopologyControls';
import { NetworkStats } from './NetworkStats';

interface Position {
  x: number;
  y: number;
}

export const NetworkTopologyView: React.FC = () => {
  const nodeStore = useNodeStore();
  const [layout, setLayout] = useState<TopologyLayout>('force');
  const [filter, setFilter] = useState<TopologyFilter>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Convert Map to array
  const nodes = useMemo(() => Array.from(nodeStore.nodes.values()), [nodeStore.nodes]);

  // Generate mock mesh connections based on existing nodes
  const meshConnections = useMemo<MeshConnection[]>(() => {
    const connections: MeshConnection[] = [];

    // Find coordinator (first node or one with most connections potential)
    const coordinator = nodes[0];
    if (!coordinator) return [];

    // Create a mesh network structure
    nodes.forEach((node, index) => {
      if (index === 0) return; // Skip coordinator connecting to itself

      // Connect to coordinator
      connections.push({
        from: coordinator.id,
        to: node.id,
        signalStrength: -45 - Math.random() * 30, // -45 to -75 dBm
        hopCount: 1,
        latency: 10 + Math.random() * 40,
        packetLoss: Math.random() * 2,
        isActive: node.status === 'active',
        lastSeen: new Date(),
      });

      // Some nodes connect to nearby nodes (not just coordinator)
      if (index > 1 && Math.random() > 0.5) {
        const targetIndex = Math.floor(Math.random() * (index - 1)) + 1;
        const targetNode = nodes[targetIndex];
        connections.push({
          from: node.id,
          to: targetNode.id,
          signalStrength: -50 - Math.random() * 35,
          hopCount: 1,
          latency: 15 + Math.random() * 50,
          packetLoss: Math.random() * 3,
          isActive: node.status === 'active' && targetNode.status === 'active',
          lastSeen: new Date(),
        });
      }
    });

    return connections;
  }, [nodes]);

  // Convert nodes to NetworkNode format
  const networkNodes = useMemo<NetworkNode[]>(() => {
    return nodes.map((node, index) => ({
      id: node.id,
      name: node.name,
      roles: node.roles,
      category: node.category,
      position: node.location?.gps,
      meshRole: index === 0 ? 'coordinator' : Math.random() > 0.3 ? 'router' : 'client',
      status: node.status === 'active' ? 'online' : node.status === 'error' ? 'warning' : 'offline',
      battery: node.battery,
      uptime: Math.floor(Math.random() * 86400 * 7), // Random uptime up to 7 days
      connections: meshConnections
        .filter(conn => conn.from === node.id || conn.to === node.id)
        .map(conn => conn.from === node.id ? conn.to : conn.from),
      signalQuality:
        Math.random() > 0.7 ? 'excellent' :
        Math.random() > 0.5 ? 'good' :
        Math.random() > 0.3 ? 'fair' : 'poor',
    }));
  }, [nodes, meshConnections]);

  // Apply filters
  const filteredNodes = useMemo(() => {
    return networkNodes.filter(node => {
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(node.category)) return false;
      }
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(node.status)) return false;
      }
      if (filter.meshRole && filter.meshRole.length > 0) {
        if (!filter.meshRole.includes(node.meshRole)) return false;
      }
      return true;
    });
  }, [networkNodes, filter]);

  const filteredConnections = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    return meshConnections.filter(
      conn => filteredNodeIds.has(conn.from) && filteredNodeIds.has(conn.to)
    );
  }, [filteredNodes, meshConnections]);

  // Calculate node positions based on layout
  const nodePositions = useMemo<Map<string, Position>>(() => {
    const positions = new Map<string, Position>();
    const width = 800;
    const height = 600;
    const padding = 80;

    if (layout === 'circular') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - padding;

      filteredNodes.forEach((node, index) => {
        const angle = (index / filteredNodes.length) * 2 * Math.PI;
        positions.set(node.id, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      });
    } else if (layout === 'hierarchical') {
      const coordinator = filteredNodes.find(n => n.meshRole === 'coordinator');
      const routers = filteredNodes.filter(n => n.meshRole === 'router');
      const clients = filteredNodes.filter(n => n.meshRole === 'client');

      // Coordinator at top center
      if (coordinator) {
        positions.set(coordinator.id, { x: width / 2, y: padding });
      }

      // Routers in middle row
      routers.forEach((node, index) => {
        const x = padding + ((width - 2 * padding) / (routers.length + 1)) * (index + 1);
        positions.set(node.id, { x, y: height / 2 });
      });

      // Clients at bottom
      clients.forEach((node, index) => {
        const x = padding + ((width - 2 * padding) / (clients.length + 1)) * (index + 1);
        positions.set(node.id, { x, y: height - padding });
      });
    } else if (layout === 'geographic' && filteredNodes.every(n => n.position)) {
      // Use actual GPS positions, normalized to viewport
      const lats = filteredNodes.map(n => n.position!.x);
      const lngs = filteredNodes.map(n => n.position!.y);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      filteredNodes.forEach(node => {
        if (node.position) {
          const x = padding + ((node.position.x - minLat) / (maxLat - minLat)) * (width - 2 * padding);
          const y = height - padding - ((node.position.y - minLng) / (maxLng - minLng)) * (height - 2 * padding);
          positions.set(node.id, { x, y });
        }
      });
    } else {
      // Force-directed layout (simplified)
      // Start with grid layout then apply some randomness
      const cols = Math.ceil(Math.sqrt(filteredNodes.length));
      filteredNodes.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = padding + ((width - 2 * padding) / cols) * (col + 0.5);
        const y = padding + ((height - 2 * padding) / Math.ceil(filteredNodes.length / cols)) * (row + 0.5);
        positions.set(node.id, {
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
        });
      });
    }

    return positions;
  }, [filteredNodes, layout]);

  const getNodeColor = (node: NetworkNode) => {
    if (node.status === 'offline') return '#9CA3AF'; // gray-400
    if (node.status === 'warning') return '#F59E0B'; // amber-500
    if (node.meshRole === 'coordinator') return '#8B5CF6'; // violet-500
    if (node.meshRole === 'router') return '#3B82F6'; // blue-500
    return '#10B981'; // green-500
  };

  const getSignalColor = (strength: number) => {
    if (strength > -50) return '#10B981'; // excellent (green)
    if (strength > -65) return '#3B82F6'; // good (blue)
    if (strength > -75) return '#F59E0B'; // fair (amber)
    return '#EF4444'; // poor (red)
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopologyControls
            layout={layout}
            onLayoutChange={setLayout}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>
        <NetworkStats
          nodes={networkNodes}
          connections={meshConnections}
        />
      </div>

      {/* Topology Visualization */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Network Topology</h3>
            <p className="text-sm text-gray-600">
              {filteredNodes.length} nodes, {filteredConnections.length} connections
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-gray-600">Coordinator</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Router</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Client</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <svg
          viewBox="0 0 800 600"
          className="w-full border border-gray-200 rounded-lg bg-gray-50"
        >
          {/* Connection Lines */}
          <g className="connections">
            {filteredConnections.map((conn, index) => {
              const fromPos = nodePositions.get(conn.from);
              const toPos = nodePositions.get(conn.to);
              if (!fromPos || !toPos) return null;

              const isHighlighted =
                selectedNode === conn.from ||
                selectedNode === conn.to ||
                hoveredNode === conn.from ||
                hoveredNode === conn.to;

              return (
                <g key={`${conn.from}-${conn.to}-${index}`}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={conn.isActive ? getSignalColor(conn.signalStrength) : '#D1D5DB'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeOpacity={isHighlighted ? 1 : 0.4}
                    strokeDasharray={conn.isActive ? '0' : '5,5'}
                  />
                  {/* Signal strength indicator */}
                  {conn.isActive && isHighlighted && (
                    <text
                      x={(fromPos.x + toPos.x) / 2}
                      y={(fromPos.y + toPos.y) / 2}
                      textAnchor="middle"
                      className="text-xs fill-gray-700"
                      style={{ fontSize: '10px' }}
                    >
                      {conn.signalStrength.toFixed(0)} dBm
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {filteredNodes.map(node => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const radius = isSelected || isHovered ? 20 : 15;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className="cursor-pointer"
                >
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={getNodeColor(node)}
                    stroke={isSelected ? '#1F2937' : 'white'}
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={node.status === 'offline' ? 0.5 : 1}
                  />

                  {/* Coordinator ring */}
                  {node.meshRole === 'coordinator' && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 5}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                    >
                      <animateTransform
                        attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        from={`0 ${pos.x} ${pos.y}`}
                        to={`360 ${pos.x} ${pos.y}`}
                        dur="10s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Battery indicator */}
                  {node.battery !== undefined && node.battery < 30 && (
                    <circle
                      cx={pos.x + radius - 5}
                      cy={pos.y - radius + 5}
                      r={4}
                      fill="#EF4444"
                      stroke="white"
                      strokeWidth={1}
                    />
                  )}

                  {/* Node label */}
                  <text
                    x={pos.x}
                    y={pos.y + radius + 14}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-900"
                    style={{ fontSize: '11px' }}
                  >
                    {node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name}
                  </text>

                  {/* Hover/Select Info */}
                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={pos.x - 100}
                        y={pos.y - radius - 80}
                        width={200}
                        height={70}
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth={1}
                        rx={4}
                        opacity={0.95}
                      />
                      <text x={pos.x} y={pos.y - radius - 62} textAnchor="middle" className="text-sm font-bold fill-gray-900" style={{ fontSize: '12px' }}>
                        {node.name}
                      </text>
                      <text x={pos.x} y={pos.y - radius - 48} textAnchor="middle" className="text-xs fill-gray-600" style={{ fontSize: '10px' }}>
                        {node.meshRole.toUpperCase()} • {node.status.toUpperCase()}
                      </text>
                      <text x={pos.x} y={pos.y - radius - 34} textAnchor="middle" className="text-xs fill-gray-600" style={{ fontSize: '10px' }}>
                        Signal: {node.signalQuality} • {node.connections.length} conn
                      </text>
                      <text x={pos.x} y={pos.y - radius - 20} textAnchor="middle" className="text-xs fill-gray-600" style={{ fontSize: '10px' }}>
                        {node.battery !== undefined ? `Battery: ${node.battery}% • ` : ''}
                        Uptime: {formatUptime(node.uptime || 0)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Node Details</h3>
          {(() => {
            const node = networkNodes.find(n => n.id === selectedNode);
            if (!node) return null;

            const nodeConnections = meshConnections.filter(
              c => c.from === node.id || c.to === node.id
            );

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{node.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mesh Role</p>
                    <p className="font-medium capitalize">{node.meshRole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{node.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Signal Quality</p>
                    <p className="font-medium capitalize">{node.signalQuality}</p>
                  </div>
                  {node.battery !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Battery</p>
                      <p className="font-medium">{node.battery}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="font-medium">{formatUptime(node.uptime || 0)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Connections ({nodeConnections.length})</p>
                  <div className="space-y-2">
                    {nodeConnections.map((conn, index) => {
                      const otherNodeId = conn.from === node.id ? conn.to : conn.from;
                      const otherNode = networkNodes.find(n => n.id === otherNodeId);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{otherNode?.name}</span>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>{conn.signalStrength.toFixed(0)} dBm</span>
                            <span>{conn.latency?.toFixed(0)} ms</span>
                            <span className={conn.isActive ? 'text-green-600' : 'text-red-600'}>
                              {conn.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
