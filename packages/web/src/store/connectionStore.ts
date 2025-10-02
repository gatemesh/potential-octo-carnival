import { create } from 'zustand';
import { SerialConnectionState } from '@/types/serial';

interface ConnectionStore extends SerialConnectionState {
  // Actions
  setConnected: (connected: boolean) => void;
  setReading: (reading: boolean) => void;
  setPort: (port: SerialPort | null) => void;
  reset: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  isConnected: false,
  isReading: false,
  port: null,

  setConnected: (isConnected) => set({ isConnected }),
  setReading: (isReading) => set({ isReading }),
  setPort: (port) => set({ port }),
  reset: () => set({ isConnected: false, isReading: false, port: null }),
}));