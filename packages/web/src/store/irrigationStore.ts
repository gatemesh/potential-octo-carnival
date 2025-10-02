import { create } from 'zustand';
import { WaterLevelData, ValveStatus, ZoneStatus } from '@/types/irrigation';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  nodeId?: number;
  timestamp: number;
}

interface IrrigationStore {
  waterLevels: Map<number, WaterLevelData>;
  valveStatuses: Map<number, ValveStatus>;
  zones: Map<number, ZoneStatus>;
  alerts: Alert[];

  // Actions
  updateWaterLevel: (data: WaterLevelData) => void;
  updateValveStatus: (status: ValveStatus) => void;
  updateZoneStatus: (status: ZoneStatus) => void;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
}

export const useIrrigationStore = create<IrrigationStore>((set) => ({
  waterLevels: new Map(),
  valveStatuses: new Map(),
  zones: new Map(),
  alerts: [],

  updateWaterLevel: (data) =>
    set((state) => {
      const newLevels = new Map(state.waterLevels);
      newLevels.set(data.nodeId, data);
      return { waterLevels: newLevels };
    }),

  updateValveStatus: (status) =>
    set((state) => {
      const newStatuses = new Map(state.valveStatuses);
      newStatuses.set(status.nodeId, status);
      return { valveStatuses: newStatuses };
    }),

  updateZoneStatus: (status) =>
    set((state) => {
      const newZones = new Map(state.zones);
      newZones.set(status.zoneId, status);
      return { zones: newZones };
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep last 50
    })),

  clearAlerts: () => set({ alerts: [] }),
}));