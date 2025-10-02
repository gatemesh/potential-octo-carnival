/**
 * LoRa Status Indicator
 * Shows connection status and stats in header
 */

import React, { useState } from 'react';
import { useLoRaStore } from '@/store/loraStore';
import { LoRaConnectionManager } from './LoRaConnectionManager';
import { Radio, Wifi, WifiOff, Cpu, Usb, Signal, Activity } from 'lucide-react';

export function LoRaStatusIndicator() {
  const { isConnected, connectionType, connectionInfo, stats } = useLoRaStore();
  const [showManager, setShowManager] = useState(false);

  const getStatusColor = () => {
    if (!isConnected) return 'text-gray-400';
    if (stats.lastRSSI && stats.lastRSSI > -75) return 'text-green-600';
    if (stats.lastRSSI && stats.lastRSSI > -90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (!isConnected) {
      return <WifiOff className="w-5 h-5" />;
    }
    if (connectionType === 'usb') {
      return <Usb className="w-5 h-5" />;
    }
    if (connectionType === 'hat') {
      return <Cpu className="w-5 h-5" />;
    }
    return <Radio className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Not Connected';
    if (connectionInfo.status === 'connecting') return 'Connecting...';
    if (connectionInfo.status === 'error') return 'Error';
    return connectionType === 'usb' ? 'USB Dongle' : 'Pi HAT';
  };

  return (
    <>
      {/* Status Button */}
      <button
        onClick={() => setShowManager(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isConnected
            ? 'bg-green-50 hover:bg-green-100 border border-green-200'
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
        }`}
        title="LoRa Connection"
      >
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>

        <div className="text-left">
          <p className={`text-xs font-semibold ${isConnected ? 'text-green-900' : 'text-gray-700'}`}>
            LoRa
          </p>
          <p className="text-xs text-gray-600">
            {getStatusText()}
          </p>
        </div>

        {/* Signal Strength */}
        {isConnected && stats.lastRSSI && (
          <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
            <Signal className={`w-3 h-3 ${getStatusColor()}`} />
            <span className="text-xs font-mono text-gray-700">
              {stats.lastRSSI}dBm
            </span>
          </div>
        )}

        {/* Packet Counter */}
        {isConnected && (
          <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
            <Activity className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-mono text-gray-700">
              {stats.packetsReceived}
            </span>
          </div>
        )}
      </button>

      {/* Connection Manager Modal */}
      {showManager && (
        <LoRaConnectionManager onClose={() => setShowManager(false)} />
      )}
    </>
  );
}
