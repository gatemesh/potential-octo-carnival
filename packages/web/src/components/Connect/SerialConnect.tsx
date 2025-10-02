import { useState } from 'react';
import { useSerialConnection } from '@/hooks/useSerialConnection';
import { parseSerialLine } from '@/utils/serialParser';
import { useNodeStore } from '@/store/nodeStore';
import { useIrrigationStore } from '@/store/irrigationStore';
import { useToastStore } from '@/store/toastStore';
import { MeshRole, NodeType } from '@/types/irrigation';
import { Plug, PlugZap, Settings } from 'lucide-react';

export function SerialConnect() {
  const [selectedRole, setSelectedRole] = useState<MeshRole>(MeshRole.CLIENT);
  const [selectedType, setSelectedType] = useState<NodeType>(NodeType.UNDEFINED);

  const { isConnected, connect, disconnect, write } = useSerialConnection({
    baudRate: 115200,
    onData: handleSerialData,
    onError: handleSerialError,
  });

  const updateNode = useNodeStore((state) => state.updateNode);
  const updateWaterLevel = useIrrigationStore((state) => state.updateWaterLevel);
  const addToast = useToastStore((state) => state.addToast);

  function handleSerialData(line: string) {
    console.log('Received:', line);

    const parsed = parseSerialLine(line);
    if (parsed) {
      switch (parsed.type) {
        case 'water_level':
          updateWaterLevel({
            nodeId: 0, // TODO: Get from context
            level: parsed.value!,
            timestamp: parsed.timestamp,
            alertTriggered: false,
          });
          break;

        case 'battery':
          updateNode(0, {
            battery: parsed.percent!,
            lastSeen: Date.now(),
          });
          break;

        case 'role':
          updateNode(0, {
            role: parsed.role!,
            lastSeen: Date.now(),
          });
          addToast({
            type: 'info',
            title: 'Role Updated',
            message: `Node role set to ${MeshRole[parsed.role!]}`,
          });
          break;

        case 'node_type':
          updateNode(0, {
            type: parsed.nodeType!,
            lastSeen: Date.now(),
          });
          addToast({
            type: 'info',
            title: 'Type Updated',
            message: `Node type set to ${NodeType[parsed.nodeType!]}`,
          });
          break;

        // Handle other message types
      }
    }
  }

  function handleSerialError(error: Error) {
    console.error('Serial error:', error);
    addToast({
      type: 'error',
      title: 'Connection Error',
      message: error.message,
    });
  }

  async function handleConnect() {
    try {
      await connect();
      addToast({
        type: 'success',
        title: 'Connected',
        message: 'Successfully connected to GateMesh device',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to serial device',
      });
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect();
      addToast({
        type: 'info',
        title: 'Disconnected',
        message: 'Serial connection closed',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async function handleTest() {
    try {
      await write('irrigation status');
      addToast({
        type: 'info',
        title: 'Command Sent',
        message: 'Irrigation status request sent',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Command Failed',
        message: 'Failed to send command to device',
      });
    }
  }

  async function handleSetRole() {
    try {
      await write(`set role ${selectedRole}`);
      addToast({
        type: 'info',
        title: 'Role Command Sent',
        message: `Setting node role to ${MeshRole[selectedRole]}`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Role Command Failed',
        message: 'Failed to send role configuration command',
      });
    }
  }

  async function handleSetType() {
    try {
      await write(`set type ${selectedType}`);
      addToast({
        type: 'info',
        title: 'Type Command Sent',
        message: `Setting node type to ${NodeType[selectedType]}`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Type Command Failed',
        message: 'Failed to send type configuration command',
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Serial Connection</h2>

      <div className="space-y-4">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Plug className="w-5 h-5" />
            Connect to Device
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <PlugZap className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Connected</span>
            </div>

            {/* Node Type Configuration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Node Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(Number(e.target.value) as NodeType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(NodeType)
                  .filter(([_key, value]) => typeof value === 'number')
                  .map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace('_', ' ')}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleSetType}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Set Type
              </button>
            </div>

            {/* Role Configuration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Node Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(Number(e.target.value) as MeshRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(MeshRole)
                  .filter(([_key, value]) => typeof value === 'number')
                  .map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace('_', ' ')}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleSetRole}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Set Role
              </button>
            </div>

            <button
              onClick={handleTest}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
            >
              Test Command
            </button>

            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Connect via USB using Web Serial API</p>
        <p className="mt-1">Supported: Chrome, Edge 89+</p>
      </div>
    </div>
  );
}