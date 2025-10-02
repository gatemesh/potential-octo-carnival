/**
 * LoRa Connection Manager
 * Supports USB LoRa dongles and Raspberry Pi LoRa HATs
 */

import React, { useState, useEffect } from 'react';
import { useSerialConnection } from '@/hooks/useSerialConnection';
import { useLoRaStore } from '@/store/loraStore';
import {
  Wifi,
  WifiOff,
  Usb,
  Cpu,
  Radio,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Signal,
  X
} from 'lucide-react';

interface LoRaConnectionManagerProps {
  onClose?: () => void;
}

export function LoRaConnectionManager({ onClose }: LoRaConnectionManagerProps) {
  const [connectionType, setConnectionType] = useState<'usb' | 'hat' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [baudRate, setBaudRate] = useState(115200);
  const [loraFrequency, setLoraFrequency] = useState(915.0); // MHz
  const [loraBandwidth, setLoraBandwidth] = useState(125); // kHz
  const [loraSpreadingFactor, setLoraSpreadingFactor] = useState(7);
  const [loraCodingRate, setLoraCodingRate] = useState(5);
  const [txPower, setTxPower] = useState(20); // dBm

  const {
    isConnected,
    connectionInfo,
    stats,
    setConnectionType: setStoreConnectionType,
    setConnected,
    setConnectionInfo,
    updateStats,
  } = useLoRaStore();

  const {
    isConnected: serialConnected,
    connect: serialConnect,
    disconnect: serialDisconnect,
    write: serialWrite,
  } = useSerialConnection({
    baudRate,
    onData: handleLoRaData,
    onError: handleLoRaError,
  });

  useEffect(() => {
    setConnected(serialConnected);
  }, [serialConnected, setConnected]);

  function handleLoRaData(data: string) {
    console.log('[LoRa RX]', data);

    // Update stats
    updateStats({
      packetsReceived: stats.packetsReceived + 1,
      lastPacketTime: Date.now(),
    });

    // Parse LoRa packets
    // Expected format: {"from":"!a1b2c3d4","to":"^all","payload":"...","rssi":-45,"snr":8.5}
    try {
      const packet = JSON.parse(data);

      if (packet.rssi) {
        updateStats({ lastRSSI: packet.rssi });
      }
      if (packet.snr) {
        updateStats({ lastSNR: packet.snr });
      }

      // Forward to mesh packet handler
      // TODO: Pass to mesh packet processor

    } catch (e) {
      // Not JSON, might be status message
      if (data.includes('RSSI:')) {
        const rssi = parseInt(data.match(/RSSI:\s*(-?\d+)/)?.[1] || '0');
        updateStats({ lastRSSI: rssi });
      }
      if (data.includes('SNR:')) {
        const snr = parseFloat(data.match(/SNR:\s*([-?\d.]+)/)?.[1] || '0');
        updateStats({ lastSNR: snr });
      }
    }
  }

  function handleLoRaError(error: Error) {
    console.error('[LoRa Error]', error);
    useLoRaStore.getState().setConnectionInfo({
      ...connectionInfo,
      status: 'error',
      lastError: error.message,
    });
  }

  async function handleConnectUSB() {
    setConnectionType('usb');
    setStoreConnectionType('usb');

    setConnectionInfo({
      type: 'usb',
      status: 'connecting',
      deviceName: 'USB LoRa Dongle',
    });

    try {
      await serialConnect();

      // Send configuration commands
      await configureLoRa();

      setConnectionInfo({
        type: 'usb',
        status: 'connected',
        deviceName: 'USB LoRa Dongle',
        frequency: loraFrequency,
        bandwidth: loraBandwidth,
        spreadingFactor: loraSpreadingFactor,
        codingRate: loraCodingRate,
        txPower,
      });

    } catch (error) {
      setConnectionInfo({
        type: 'usb',
        status: 'error',
        lastError: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  }

  async function handleConnectHAT() {
    setConnectionType('hat');
    setStoreConnectionType('hat');

    setConnectionInfo({
      type: 'hat',
      status: 'connecting',
      deviceName: 'Raspberry Pi LoRa HAT',
    });

    try {
      // For Raspberry Pi HAT, we'll use HTTP API to the local server
      // which communicates with the HAT via SPI
      const response = await fetch('/api/lora/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: loraFrequency,
          bandwidth: loraBandwidth,
          spreadingFactor: loraSpreadingFactor,
          codingRate: loraCodingRate,
          txPower,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setConnectionInfo({
        type: 'hat',
        status: 'connected',
        deviceName: data.deviceName || 'Raspberry Pi LoRa HAT',
        frequency: loraFrequency,
        bandwidth: loraBandwidth,
        spreadingFactor: loraSpreadingFactor,
        codingRate: loraCodingRate,
        txPower,
      });

      setConnected(true);

      // Start polling for packets
      startHATPolling();

    } catch (error) {
      setConnectionInfo({
        type: 'hat',
        status: 'error',
        lastError: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  }

  async function configureLoRa() {
    // Send AT commands to configure LoRa module
    await serialWrite(`AT+FREQ=${loraFrequency}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    await serialWrite(`AT+BW=${loraBandwidth}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    await serialWrite(`AT+SF=${loraSpreadingFactor}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    await serialWrite(`AT+CR=${loraCodingRate}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    await serialWrite(`AT+PWR=${txPower}`);
    await new Promise(resolve => setTimeout(resolve, 100));

    await serialWrite('AT+MODE=RX'); // Set to receive mode
  }

  function startHATPolling() {
    // Poll for packets every 100ms
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/lora/poll');
        if (response.ok) {
          const packets = await response.json();
          packets.forEach((packet: any) => handleLoRaData(JSON.stringify(packet)));
        }
      } catch (error) {
        console.error('[HAT Polling Error]', error);
      }
    }, 100);

    // Store interval ID for cleanup
    (window as any).loraHATInterval = intervalId;
  }

  async function handleDisconnect() {
    if (connectionType === 'usb') {
      await serialDisconnect();
    } else if (connectionType === 'hat') {
      // Stop HAT polling
      clearInterval((window as any).loraHATInterval);

      // Disconnect HAT
      await fetch('/api/lora/disconnect', { method: 'POST' });
    }

    setConnectionType(null);
    setConnected(false);
    setConnectionInfo({
      status: 'disconnected',
    });
  }

  async function handleTestTransmit() {
    const testPacket = {
      from: '!00000000',
      to: '^all',
      payload: 'GateMesh Test Packet',
      timestamp: Date.now(),
    };

    try {
      if (connectionType === 'usb') {
        await serialWrite(`TX:${JSON.stringify(testPacket)}`);
      } else if (connectionType === 'hat') {
        await fetch('/api/lora/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPacket),
        });
      }

      updateStats({
        packetsSent: stats.packetsSent + 1,
      });

    } catch (error) {
      console.error('[TX Error]', error);
    }
  }

  const signalStrength = stats.lastRSSI
    ? stats.lastRSSI > -60 ? 'excellent'
      : stats.lastRSSI > -75 ? 'good'
      : stats.lastRSSI > -90 ? 'fair'
      : 'poor'
    : 'unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Radio className="w-6 h-6 text-blue-600" />
              LoRa Connection
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect to USB dongle or Raspberry Pi HAT
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Connection Status */}
          {isConnected && connectionInfo.status === 'connected' && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-900">Connected</p>
                    <p className="text-sm text-green-700">{connectionInfo.deviceName}</p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">RSSI</p>
                  <div className="flex items-center gap-2">
                    <Signal className={`w-4 h-4 ${
                      signalStrength === 'excellent' ? 'text-green-600' :
                      signalStrength === 'good' ? 'text-blue-600' :
                      signalStrength === 'fair' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                    <p className="text-lg font-bold text-gray-900">
                      {stats.lastRSSI || '--'} dBm
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">SNR</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.lastSNR?.toFixed(1) || '--'} dB
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">RX</p>
                  <p className="text-lg font-bold text-gray-900">{stats.packetsReceived}</p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">TX</p>
                  <p className="text-lg font-bold text-gray-900">{stats.packetsSent}</p>
                </div>
              </div>

              {/* Test Button */}
              <button
                onClick={handleTestTransmit}
                className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Send Test Packet
              </button>
            </div>
          )}

          {/* Connection Type Selection */}
          {!isConnected && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* USB Dongle */}
                <button
                  onClick={handleConnectUSB}
                  disabled={connectionInfo.status === 'connecting'}
                  className="p-6 border-2 border-gray-300 hover:border-blue-500 rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Usb className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">USB LoRa Dongle</h3>
                  <p className="text-sm text-gray-600">
                    Connect via USB serial port
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Works with most LoRa USB modules
                  </p>
                </button>

                {/* Raspberry Pi HAT */}
                <button
                  onClick={handleConnectHAT}
                  disabled={connectionInfo.status === 'connecting'}
                  className="p-6 border-2 border-gray-300 hover:border-green-500 rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cpu className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Raspberry Pi HAT</h3>
                  <p className="text-sm text-gray-600">
                    Connect to local HAT via SPI
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Requires backend API running
                  </p>
                </button>
              </div>

              {/* Advanced Settings */}
              <details
                open={showAdvanced}
                onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
                className="border border-gray-200 rounded-lg"
              >
                <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced LoRa Settings
                </summary>
                <div className="p-4 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency (MHz)
                      </label>
                      <input
                        type="number"
                        value={loraFrequency}
                        onChange={(e) => setLoraFrequency(parseFloat(e.target.value))}
                        step="0.1"
                        min="860"
                        max="930"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        US: 915, EU: 868, AS: 923
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bandwidth (kHz)
                      </label>
                      <select
                        value={loraBandwidth}
                        onChange={(e) => setLoraBandwidth(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="125">125 kHz</option>
                        <option value="250">250 kHz</option>
                        <option value="500">500 kHz</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spreading Factor
                      </label>
                      <select
                        value={loraSpreadingFactor}
                        onChange={(e) => setLoraSpreadingFactor(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {[7, 8, 9, 10, 11, 12].map((sf) => (
                          <option key={sf} value={sf}>SF{sf}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher = longer range, slower
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coding Rate
                      </label>
                      <select
                        value={loraCodingRate}
                        onChange={(e) => setLoraCodingRate(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {[5, 6, 7, 8].map((cr) => (
                          <option key={cr} value={cr}>4/{cr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TX Power (dBm)
                      </label>
                      <input
                        type="number"
                        value={txPower}
                        onChange={(e) => setTxPower(parseInt(e.target.value))}
                        min="2"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baud Rate (USB only)
                      </label>
                      <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="9600">9600</option>
                        <option value="57600">57600</option>
                        <option value="115200">115200</option>
                        <option value="921600">921600</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>

              {/* Error Display */}
              {connectionInfo.status === 'error' && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-bold text-red-900">Connection Failed</p>
                      <p className="text-sm text-red-700">{connectionInfo.lastError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">Connection Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>USB dongles require browser support for Web Serial API (Chrome/Edge)</li>
                      <li>Raspberry Pi HAT requires the GateMesh backend service running</li>
                      <li>Make sure your LoRa frequency matches your region's regulations</li>
                      <li>Higher spreading factors provide longer range but slower data rates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
