import { useState } from 'react';
import { useIrrigationStore } from '@/store/irrigationStore';
import { useSerialConnection } from '@/hooks/useSerialConnection';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  nodeId: number;
}

export function ValveControlCard({ nodeId }: Props) {
  const [loading, setLoading] = useState(false);
  const valveStatus = useIrrigationStore(
    (state) => state.valveStatuses.get(nodeId)
  );
  const { write, isConnected } = useSerialConnection();

  async function handleOpen() {
    if (!isConnected) return;

    setLoading(true);
    try {
      await write(`irrigation valve open ${nodeId}`);
    } catch (error) {
      console.error('Failed to open valve:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }

  async function handleClose() {
    if (!isConnected) return;

    setLoading(true);
    try {
      await write(`irrigation valve close ${nodeId}`);
    } catch (error) {
      console.error('Failed to close valve:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }

  const isOpen = valveStatus?.state === 'open';
  const position = valveStatus?.position || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Valve #{nodeId}</h3>
        {isOpen ? (
          <Unlock className="w-6 h-6 text-green-500" />
        ) : (
          <Lock className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Position Display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-gray-900">
          {position}%
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {valveStatus?.isMoving ? 'Moving...' : valveStatus?.state || 'Unknown'}
        </div>
      </div>

      {/* Position Bar */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${position}%` }}
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleOpen}
          disabled={loading || !isConnected || isOpen}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Open
        </button>
        <button
          onClick={handleClose}
          disabled={loading || !isConnected || !isOpen}
          className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>
      </div>

      {/* Stats */}
      {valveStatus && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Cycles:</span>
            <span className="font-semibold">{valveStatus.cycleCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}