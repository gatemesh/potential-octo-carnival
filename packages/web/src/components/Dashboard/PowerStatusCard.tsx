import { useEffect } from 'react';
import { useNodeStore } from '@/store/nodeStore';
import { useDataHistoryStore } from '@/store/dataHistoryStore';
import { MeshRole, NodeType } from '@/types/irrigation';
import { Battery, Sun, Zap, Wifi, Radio, Cpu } from 'lucide-react';

interface Props {
  nodeId: number;
}

export function PowerStatusCard({ nodeId }: Props) {
  const node = useNodeStore((state) => state.getNode(nodeId));
  const batteryHistory = useDataHistoryStore(
    (state) => state.getBatteryHistory(nodeId, 20)
  );
  const signalHistory = useDataHistoryStore(
    (state) => state.getSignalHistory(nodeId, 20)
  );
  const addBatteryLevel = useDataHistoryStore((state) => state.addBatteryLevel);
  const addSignalStrength = useDataHistoryStore((state) => state.addSignalStrength);

  // Record data points when node updates
  useEffect(() => {
    if (node) {
      addBatteryLevel(nodeId, node.battery);
      addSignalStrength(nodeId, node.rssi);
    }
  }, [node, nodeId, addBatteryLevel, addSignalStrength]);

  if (!node) return null;

  const isCharging = node.solar > node.battery;
  const batteryLevel = node.battery;
  const signalStrength = Math.max(0, Math.min(100, (node.rssi + 100) * 2)); // Convert dBm to percentage

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Power Status</h3>
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4" />
            <span>{NodeType[node.type]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-4 h-4" />
            <span>{MeshRole[node.role]}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Battery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Battery</span>
            </div>
            <span className="text-lg font-bold">{batteryLevel}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                batteryLevel > 60
                  ? 'bg-green-500'
                  : batteryLevel > 30
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
          {batteryHistory.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              {batteryHistory.length} readings • Avg: {(
                batteryHistory.reduce((sum, point) => sum + point.value, 0) / batteryHistory.length
              ).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Solar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">Solar</span>
            </div>
            <span className="text-sm font-semibold">{node.solar}V</span>
          </div>
        </div>

        {/* Signal Strength */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Signal</span>
            </div>
            <span className="text-sm font-semibold">{node.rssi} dBm</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                signalStrength > 70
                  ? 'bg-green-500'
                  : signalStrength > 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${signalStrength}%` }}
            />
          </div>
          {signalHistory.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              {signalHistory.length} readings • Best: {Math.max(...signalHistory.map(p => p.value))} dBm
            </div>
          )}
        </div>

        {/* Charging Status */}
        {isCharging && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Charging</span>
          </div>
        )}

        {/* Mini charts */}
        {(batteryHistory.length > 1 || signalHistory.length > 1) && (
          <div className="pt-3 border-t">
            <div className="text-xs text-gray-600 mb-2">Recent Trends</div>
            <div className="flex gap-2">
              {batteryHistory.length > 1 && (
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Battery</div>
                  <div className="flex items-end gap-1 h-8">
                    {batteryHistory.slice(-8).map((point) => (
                      <div
                        key={point.timestamp}
                        className="bg-green-400 rounded-sm flex-1"
                        style={{ height: `${point.value}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {signalHistory.length > 1 && (
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Signal</div>
                  <div className="flex items-end gap-1 h-8">
                    {signalHistory.slice(-8).map((point) => {
                      const strength = Math.max(0, Math.min(100, (point.value + 100) * 2));
                      return (
                        <div
                          key={point.timestamp}
                          className="bg-blue-400 rounded-sm flex-1"
                          style={{ height: `${strength}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}