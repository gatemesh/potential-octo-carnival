/**
 * WaterFlowVisualizer - Animated water flow path visualization
 */

import React, { useState, useEffect } from 'react';
import { IrrigationPath, IrrigationPathNode, PathConnection } from '@/types/agriculture';
import { useNodeStore } from '@/store/nodeStore';
import { usePathStore } from '@/store/pathStore';
import { ScheduleManager } from './ScheduleManager';
import {
  Droplets,
  Play,
  Square,
  AlertCircle,
  Gauge,
  TrendingUp,
  Info,
  Calendar,
} from 'lucide-react';

interface WaterFlowVisualizerProps {
  pathId: string;
}

export function WaterFlowVisualizer({ pathId }: WaterFlowVisualizerProps) {
  const path = usePathStore((state) => state.getPath(pathId));
  const nodes = useNodeStore((state) => state.nodes);
  const { startFlow, stopFlow, updateFlowMetrics, addSchedule, updateSchedule, deleteSchedule } = usePathStore();

  const [animationFrame, setAnimationFrame] = useState(0);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  // Animate water flow
  useEffect(() => {
    if (!path?.isFlowing) return;

    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 100);
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, [path?.isFlowing]);

  if (!path) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
        <p className="text-red-800 text-center">Path not found</p>
      </div>
    );
  }

  // Get node details
  function getNodeDetails(nodeId: string) {
    const node = nodes.get(nodeId);
    const pathNode = path.nodes.find(n => n.nodeId === nodeId);
    return { node, pathNode };
  }

  // Get node icon based on type
  function getNodeIcon(type: string): string {
    const icons: Record<string, string> = {
      source: '🌊',
      pump: '⚙️',
      valve: '🚰',
      sensor: '📊',
      junction: '🔀',
      endpoint: '🌾',
    };
    return icons[type] || '📍';
  }

  // Get status color
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ok: 'green',
      warning: 'yellow',
      error: 'red',
      offline: 'gray',
    };
    return colors[status] || 'gray';
  }

  function handleToggleFlow() {
    if (path.isFlowing) {
      stopFlow(path.id);
    } else {
      startFlow(path.id);
      // Simulate flow metrics
      updateFlowMetrics(path.id, {
        totalFlowRate: 150 + Math.random() * 50,
        totalPressure: 25 + Math.random() * 10,
      });
    }
  }

  // Calculate SVG dimensions
  const svgWidth = 800;
  const svgHeight = 400;
  const padding = 50;

  // Auto-layout nodes if positions not set
  const layoutNodes = path.nodes.map((pathNode, index) => {
    if (pathNode.position) {
      return {
        ...pathNode,
        x: (pathNode.position.x / 100) * (svgWidth - 2 * padding) + padding,
        y: (pathNode.position.y / 100) * (svgHeight - 2 * padding) + padding,
      };
    }

    // Simple left-to-right layout
    const x = padding + ((svgWidth - 2 * padding) / (path.nodes.length - 1)) * index;
    const y = svgHeight / 2;
    return { ...pathNode, x, y };
  });

  return (
    <div className="space-y-4">
      {/* Schedule Manager Modal */}
      {showScheduleManager && (
        <ScheduleManager
          pathId={path.id}
          schedules={path.schedules || []}
          nodeIds={path.nodes.map((n) => n.nodeId)}
          onAddSchedule={(schedule) => addSchedule(path.id, schedule)}
          onUpdateSchedule={(scheduleId, updates) => updateSchedule(path.id, scheduleId, updates)}
          onDeleteSchedule={(scheduleId) => deleteSchedule(path.id, scheduleId)}
          onClose={() => setShowScheduleManager(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{path.name}</h3>
          {path.description && (
            <p className="text-sm text-gray-600 mt-1">{path.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-semibold rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Schedules
            {path.schedules && path.schedules.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                {path.schedules.length}
              </span>
            )}
          </button>
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              path.status === 'active'
                ? 'bg-green-100 text-green-800'
                : path.status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {path.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Metrics */}
      {path.isFlowing && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-sm font-medium">Flow Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {path.totalFlowRate?.toFixed(1) || '0'} <span className="text-sm">GPM</span>
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Gauge className="w-5 h-5" />
              <span className="text-sm font-medium">Pressure</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {path.totalPressure?.toFixed(1) || '0'} <span className="text-sm">PSI</span>
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Volume Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {path.totalVolumeToday?.toFixed(0) || '0'} <span className="text-sm">gal</span>
            </p>
          </div>
        </div>
      )}

      {/* Flow Visualization */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <svg width={svgWidth} height={svgHeight} className="w-full">
          <defs>
            {/* Water flow gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>

            {/* Animated water flow */}
            <linearGradient id="flowAnimation" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="0;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8">
                <animate
                  attributeName="offset"
                  values="0.5;1.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0">
                <animate
                  attributeName="offset"
                  values="1;2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          {/* Draw connections */}
          {path.connections.map((conn, idx) => {
            const fromNode = layoutNodes.find(n => n.nodeId === conn.from);
            const toNode = layoutNodes.find(n => n.nodeId === conn.to);

            if (!fromNode || !toNode) return null;

            return (
              <g key={idx}>
                {/* Pipe */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Water flow animation */}
                {conn.isFlowing && path.isFlowing && (
                  <>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="url(#flowAnimation)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    {/* Flow direction arrow */}
                    <polygon
                      points={`${toNode.x - 15},${toNode.y - 8} ${toNode.x - 15},${toNode.y + 8} ${toNode.x - 5},${toNode.y}`}
                      fill="#06B6D4"
                      opacity="0.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values={`0,0; ${(toNode.x - fromNode.x) * 0.1},${(toNode.y - fromNode.y) * 0.1}`}
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </polygon>
                  </>
                )}

                {/* Connection label */}
                {conn.size && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 10}
                    fontSize="10"
                    fill="#64748B"
                    textAnchor="middle"
                  >
                    {conn.size}" {conn.type}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {layoutNodes.map((layoutNode) => {
            const { node, pathNode } = getNodeDetails(layoutNode.nodeId);
            const statusColor = getStatusColor(layoutNode.status);

            return (
              <g key={layoutNode.nodeId}>
                {/* Node circle */}
                <circle
                  cx={layoutNode.x}
                  cy={layoutNode.y}
                  r="25"
                  fill={statusColor === 'green' ? '#10B981' : statusColor === 'yellow' ? '#F59E0B' : statusColor === 'red' ? '#EF4444' : '#9CA3AF'}
                  stroke="#fff"
                  strokeWidth="3"
                  opacity="0.9"
                />

                {/* Active indicator */}
                {layoutNode.isActive && path.isFlowing && (
                  <circle
                    cx={layoutNode.x}
                    cy={layoutNode.y}
                    r="30"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="25;35;25"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node icon */}
                <text
                  x={layoutNode.x}
                  y={layoutNode.y + 5}
                  fontSize="20"
                  textAnchor="middle"
                >
                  {getNodeIcon(layoutNode.type)}
                </text>

                {/* Node label */}
                <text
                  x={layoutNode.x}
                  y={layoutNode.y + 45}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#1F2937"
                  textAnchor="middle"
                >
                  {node?.userGivenName || node?.id || 'Unknown'}
                </text>

                {/* Node type */}
                <text
                  x={layoutNode.x}
                  y={layoutNode.y + 60}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {layoutNode.type}
                </text>

                {/* Flow metrics */}
                {layoutNode.flowRate && (
                  <text
                    x={layoutNode.x}
                    y={layoutNode.y + 75}
                    fontSize="9"
                    fill="#3B82F6"
                    textAnchor="middle"
                  >
                    {layoutNode.flowRate.toFixed(1)} GPM
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFlow}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              path.isFlowing
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {path.isFlowing ? (
              <>
                <Square className="w-5 h-5" />
                Stop Flow
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Flow
              </>
            )}
          </button>

          {path.lastActivated && (
            <div className="text-sm text-gray-600">
              Last activated: {new Date(path.lastActivated).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>{path.nodes.length} nodes, {path.connections.length} connections</span>
        </div>
      </div>

      {/* Node Details List */}
      <details className="bg-white border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
          Node Details ({path.nodes.length})
        </summary>
        <div className="p-4 space-y-2 border-t border-gray-200">
          {path.nodes.map((pathNode) => {
            const { node } = getNodeDetails(pathNode.nodeId);
            return (
              <div
                key={pathNode.nodeId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getNodeIcon(pathNode.type)}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {node?.userGivenName || node?.id || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Order: {pathNode.order} • Type: {pathNode.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      pathNode.status === 'ok'
                        ? 'bg-green-100 text-green-800'
                        : pathNode.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : pathNode.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pathNode.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
