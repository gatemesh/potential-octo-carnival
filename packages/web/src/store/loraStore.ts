/**
 * LoRa Connection Store
 * Manages LoRa USB dongle and Raspberry Pi HAT connections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoRaConnectionInfo {
  type?: 'usb' | 'hat';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  deviceName?: string;
  frequency?: number;
  bandwidth?: number;
  spreadingFactor?: number;
  codingRate?: number;
  txPower?: number;
  lastError?: string;
}

export interface LoRaStats {
  packetsReceived: number;
  packetsSent: number;
  packetsDropped: number;
  lastRSSI: number | null;
  lastSNR: number | null;
  lastPacketTime: number | null;
  connectedSince: number | null;
}

interface LoRaStore {
  // Connection state
  isConnected: boolean;
  connectionType: 'usb' | 'hat' | null;
  connectionInfo: LoRaConnectionInfo;
  stats: LoRaStats;

  // Actions
  setConnected: (connected: boolean) => void;
  setConnectionType: (type: 'usb' | 'hat' | null) => void;
  setConnectionInfo: (info: LoRaConnectionInfo) => void;
  updateStats: (updates: Partial<LoRaStats>) => void;
  resetStats: () => void;
  disconnect: () => void;
}

const initialStats: LoRaStats = {
  packetsReceived: 0,
  packetsSent: 0,
  packetsDropped: 0,
  lastRSSI: null,
  lastSNR: null,
  lastPacketTime: null,
  connectedSince: null,
};

export const useLoRaStore = create<LoRaStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      connectionType: null,
      connectionInfo: {
        status: 'disconnected',
      },
      stats: initialStats,

      setConnected: (connected) => {
        set((state) => ({
          isConnected: connected,
          stats: connected
            ? { ...state.stats, connectedSince: Date.now() }
            : initialStats,
        }));
      },

      setConnectionType: (type) => {
        set({ connectionType: type });
      },

      setConnectionInfo: (info) => {
        set({ connectionInfo: info });
      },

      updateStats: (updates) => {
        set((state) => ({
          stats: { ...state.stats, ...updates },
        }));
      },

      resetStats: () => {
        set({ stats: initialStats });
      },

      disconnect: () => {
        set({
          isConnected: false,
          connectionType: null,
          connectionInfo: { status: 'disconnected' },
          stats: initialStats,
        });
      },
    }),
    {
      name: 'gatemesh-lora-connection',
      partialize: (state) => ({
        // Don't persist connection state, only preferences
        connectionInfo: {
          frequency: state.connectionInfo.frequency,
          bandwidth: state.connectionInfo.bandwidth,
          spreadingFactor: state.connectionInfo.spreadingFactor,
          codingRate: state.connectionInfo.codingRate,
          txPower: state.connectionInfo.txPower,
        },
      }),
    }
  )
);
