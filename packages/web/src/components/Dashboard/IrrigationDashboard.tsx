
import { useNodeStore } from '@/store/nodeStore';
import { WaterLevelCard } from './WaterLevelCard';
import { ValveControlCard } from './ValveControlCard';
import { PowerStatusCard } from './PowerStatusCard';
import { NodeType } from '@/types/agriculture';

export function IrrigationDashboard() {
  const nodes = useNodeStore((state) => Array.from(state.nodes.values()));
  const waterSensors = nodes.filter((n) => n.roles?.includes(NodeType.WATER_LEVEL_SENSOR) || n.nodeTypes?.includes(NodeType.WATER_LEVEL_SENSOR));
  const valves = nodes.filter((n) => n.roles?.includes(NodeType.GATE_VALVE) || n.nodeTypes?.includes(NodeType.GATE_VALVE));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            GateMesh Irrigation Control
          </h1>
          <p className="text-gray-600 mt-2">
            {nodes.length} nodes connected
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* All Nodes */}
          {nodes.length === 0 && (
            <div className="col-span-full p-8 bg-white rounded-xl shadow-md text-center">
              <p className="text-gray-600">No nodes found. Add nodes or log in with demo account.</p>
            </div>
          )}

          {nodes.map((node) => (
            <div key={node.id} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{node.name || node.userGivenName || node.id}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{node.category || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${node.status === 'active' ? 'text-green-600' : node.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {node.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Battery:</span>
                  <span className="font-medium">{node.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signal:</span>
                  <span className="font-medium">{node.signal || node.rssi} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{node.meshRole}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}