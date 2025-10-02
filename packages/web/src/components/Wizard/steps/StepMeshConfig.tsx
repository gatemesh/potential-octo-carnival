/**
 * Step 2: Mesh Network Configuration
 */

import React from 'react';
import { GateMeshNode, MeshRole } from '@/types/agriculture';
import { Radio, Router, Repeat, MapPin, EyeOff, Shield, Wifi } from 'lucide-react';

interface StepMeshConfigProps {
  node: GateMeshNode;
  updateNode: (updates: Partial<GateMeshNode>) => void;
}

interface MeshRoleInfo {
  role: MeshRole;
  name: string;
  description: string;
  icon: any;
  powerUsage: 'low' | 'medium' | 'high';
  recommended: string[];
}

const MESH_ROLES: MeshRoleInfo[] = [
  {
    role: MeshRole.CLIENT,
    name: 'Client',
    description: 'Standard node that sends and receives messages. Best for battery-powered sensors.',
    icon: Radio,
    powerUsage: 'low',
    recommended: ['Water Level Sensor', 'Soil Moisture', 'Weather Station'],
  },
  {
    role: MeshRole.ROUTER,
    name: 'Router',
    description: 'Always-on node that relays messages for other nodes. Requires constant power.',
    icon: Router,
    powerUsage: 'high',
    recommended: ['Headgate Controller', 'Base Station', 'Solar-Powered Nodes'],
  },
  {
    role: MeshRole.ROUTER_CLIENT,
    name: 'Router + Client',
    description: 'Acts as both a client and router. Extends network range while performing sensor duties.',
    icon: Wifi,
    powerUsage: 'high',
    recommended: ['Section Controller', 'Greenhouse Controller'],
  },
  {
    role: MeshRole.REPEATER,
    name: 'Repeater',
    description: 'Dedicated message relay. Does not send own messages, only forwards others.',
    icon: Repeat,
    powerUsage: 'medium',
    recommended: ['Range Extender', 'Signal Bridge'],
  },
  {
    role: MeshRole.TRACKER,
    name: 'Tracker',
    description: 'GPS-enabled node for tracking mobile assets or livestock.',
    icon: MapPin,
    powerUsage: 'medium',
    recommended: ['Livestock Tracker', 'Equipment Tracker'],
  },
  {
    role: MeshRole.SENSOR,
    name: 'Sensor (Low Power)',
    description: 'Ultra-low power mode. Wakes periodically to send data then sleeps.',
    icon: Shield,
    powerUsage: 'low',
    recommended: ['Remote Sensors', 'Battery-Only Nodes'],
  },
  {
    role: MeshRole.CLIENT_HIDDEN,
    name: 'Hidden Client',
    description: 'Does not announce presence. Useful for security or minimal network chatter.',
    icon: EyeOff,
    powerUsage: 'low',
    recommended: ['Security Sensors', 'Stealth Monitoring'],
  },
];

export function StepMeshConfig({ node, updateNode }: StepMeshConfigProps) {
  const selectedRole = node.meshRole || MeshRole.CLIENT;

  function handleRoleSelect(role: MeshRole) {
    updateNode({ meshRole: role });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Network Role Configuration</h3>
        <p className="text-gray-600">
          Choose how this node participates in the mesh network. This affects power consumption and network coverage.
        </p>
      </div>

      {/* Current Node Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Node ID: {node.id}</p>
            <p className="text-sm text-blue-800">
              Battery: {node.battery}% | {node.solar ? 'Solar Powered' : 'Battery Only'}
            </p>
          </div>
        </div>
      </div>

      {/* Mesh Role Selection */}
      <div className="space-y-3">
        {MESH_ROLES.map((roleInfo) => {
          const Icon = roleInfo.icon;
          const isSelected = selectedRole === roleInfo.role;

          return (
            <button
              key={roleInfo.role}
              onClick={() => handleRoleSelect(roleInfo.role)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{roleInfo.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        roleInfo.powerUsage === 'low'
                          ? 'bg-green-100 text-green-800'
                          : roleInfo.powerUsage === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {roleInfo.powerUsage} power
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{roleInfo.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-gray-700">Recommended for:</span>
                    {roleInfo.recommended.map((rec) => (
                      <span
                        key={rec}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Power Warning */}
      {selectedRole === MeshRole.ROUTER && node.battery < 100 && !node.solar && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            ⚠️ <strong>Warning:</strong> Router mode requires constant power. This node appears to be battery-powered. Consider using "Client" mode or adding solar power.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> A healthy mesh network needs a mix of clients and routers. Place router nodes strategically to extend range and improve reliability.
        </p>
      </div>
    </div>
  );
}
