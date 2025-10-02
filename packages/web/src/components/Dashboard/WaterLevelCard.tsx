import { useEffect } from 'react';
import { useIrrigationStore } from '@/store/irrigationStore';
import { useDataHistoryStore } from '@/store/dataHistoryStore';
import { Droplet, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  nodeId: number;
}

export function WaterLevelCard({ nodeId }: Props) {
  const waterLevel = useIrrigationStore(
    (state) => state.waterLevels.get(nodeId)
  );
  const history = useDataHistoryStore(
    (state) => state.getWaterLevelHistory(nodeId, 20)
  );
  const addWaterLevel = useDataHistoryStore((state) => state.addWaterLevel);

  // Record data point when water level updates
  useEffect(() => {
    if (waterLevel) {
      addWaterLevel(nodeId, waterLevel.level);
    }
  }, [waterLevel, nodeId, addWaterLevel]);

  if (!waterLevel) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Water Level</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const percent = (waterLevel.level / 10) * 100; // Assuming 10ft max
  const isLow = waterLevel.level < 2.0;
  const isHigh = waterLevel.level > 8.0;

  // Calculate trend
  const recentLevels = history.slice(-5);
  const trend = recentLevels.length >= 2
    ? recentLevels[recentLevels.length - 1].value - recentLevels[0].value
    : 0;
  const isRising = trend > 0.1;
  const isFalling = trend < -0.1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Water Level</h3>
        <div className="flex items-center gap-2">
          <Droplet className="w-6 h-6 text-blue-500" />
          {isRising && <TrendingUp className="w-4 h-4 text-green-500" />}
          {isFalling && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
        </div>
      </div>

      <div className="space-y-4">
        {/* Large reading */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {waterLevel.level.toFixed(1)}
          </div>
          <div className="text-lg text-gray-600 mt-1">feet</div>
          {history.length > 1 && (
            <div className="text-sm text-gray-500 mt-1">
              {isRising && `+${trend.toFixed(1)} ft trend`}
              {isFalling && `${trend.toFixed(1)} ft trend`}
              {!isRising && !isFalling && 'Stable'}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHigh ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>

        {/* Mini trend chart */}
        {history.length > 1 && (
          <div className="flex items-end justify-center gap-1 h-12">
            {history.slice(-10).map((point) => {
              const height = Math.max((point.value / 10) * 100, 5); // Min 5% height
              return (
                <div
                  key={point.timestamp}
                  className="bg-blue-400 rounded-sm flex-1 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${point.value.toFixed(1)} ft at ${new Date(point.timestamp).toLocaleTimeString()}`}
                />
              );
            })}
          </div>
        )}

        {/* Alerts */}
        {(isLow || isHigh) && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isHigh ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isHigh ? 'High water level!' : 'Low water level'}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-center">
          Updated: {new Date(waterLevel.timestamp).toLocaleTimeString()}
          {history.length > 0 && ` • ${history.length} data points`}
        </div>
      </div>
    </div>
  );
}