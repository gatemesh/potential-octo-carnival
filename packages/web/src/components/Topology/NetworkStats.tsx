import React, { useMemo } from 'react';
import { NetworkNode, MeshConnection } from '@/types/agriculture';

interface NetworkStatsProps {
  nodes: NetworkNode[];
  connections: MeshConnection[];
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ nodes, connections }) => {
  const stats = useMemo(() => {
    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;
    const warningNodes = nodes.filter(n => n.status === 'warning').length;

    const coordinator = nodes.find(n => n.meshRole === 'coordinator');
    const routers = nodes.filter(n => n.meshRole === 'router').length;
    const clients = nodes.filter(n => n.meshRole === 'client').length;

    const activeConnections = connections.filter(c => c.isActive).length;
    const totalConnections = connections.length;

    const signalStrengths = connections
      .filter(c => c.isActive)
      .map(c => c.signalStrength);
    const avgSignalStrength = signalStrengths.length > 0
      ? signalStrengths.reduce((a, b) => a + b, 0) / signalStrengths.length
      : 0;

    const latencies = connections
      .filter(c => c.isActive && c.latency)
      .map(c => c.latency!);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const packetLosses = connections
      .filter(c => c.isActive && c.packetLoss !== undefined)
      .map(c => c.packetLoss!);
    const avgPacketLoss = packetLosses.length > 0
      ? packetLosses.reduce((a, b) => a + b, 0) / packetLosses.length
      : 0;

    const lowBatteryNodes = nodes.filter(
      n => n.battery !== undefined && n.battery < 20
    ).length;

    // Network health score (0-100)
    const healthScore = Math.round(
      (onlineNodes / totalNodes) * 40 +
      (activeConnections / totalConnections) * 30 +
      ((avgSignalStrength + 90) / 50) * 20 + // normalize -90 to -40 to 0-100
      (100 - avgPacketLoss * 10) * 0.1
    );

    return {
      totalNodes,
      onlineNodes,
      offlineNodes,
      warningNodes,
      coordinatorName: coordinator?.name || 'None',
      routers,
      clients,
      activeConnections,
      totalConnections,
      avgSignalStrength,
      avgLatency,
      avgPacketLoss,
      lowBatteryNodes,
      healthScore,
    };
  }, [nodes, connections]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Network Stats</h3>

      <div className="space-y-4">
        {/* Network Health */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Network Health</span>
            <span className={`text-lg font-bold ${getHealthColor(stats.healthScore)}`}>
              {stats.healthScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stats.healthScore >= 80
                  ? 'bg-green-600'
                  : stats.healthScore >= 60
                  ? 'bg-blue-600'
                  : stats.healthScore >= 40
                  ? 'bg-amber-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${stats.healthScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{getHealthLabel(stats.healthScore)}</p>
        </div>

        {/* Node Stats */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Nodes</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium">{stats.totalNodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Online</span>
              <span className="font-medium text-green-600">{stats.onlineNodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600">Warning</span>
              <span className="font-medium text-amber-600">{stats.warningNodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offline</span>
              <span className="font-medium text-gray-600">{stats.offlineNodes}</span>
            </div>
          </div>
        </div>

        {/* Mesh Roles */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Mesh Roles</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-violet-600">Coordinator</span>
              <span className="font-medium text-violet-600">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Routers</span>
              <span className="font-medium text-blue-600">{stats.routers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Clients</span>
              <span className="font-medium text-green-600">{stats.clients}</span>
            </div>
          </div>
        </div>

        {/* Connection Stats */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Connections</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-medium text-green-600">
                {stats.activeConnections} / {stats.totalConnections}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Signal</span>
              <span className="font-medium">{stats.avgSignalStrength.toFixed(0)} dBm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Latency</span>
              <span className="font-medium">{stats.avgLatency.toFixed(0)} ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Packet Loss</span>
              <span className="font-medium">{stats.avgPacketLoss.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.lowBatteryNodes > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Low Battery Alert</h4>
                  <p className="text-xs text-red-700 mt-1">
                    {stats.lowBatteryNodes} node{stats.lowBatteryNodes > 1 ? 's' : ''} below 20%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
