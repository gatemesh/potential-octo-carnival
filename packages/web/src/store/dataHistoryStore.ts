import { create } from 'zustand';

interface DataPoint {
  timestamp: number;
  value: number;
  nodeId?: number;
}

interface DataHistory {
  waterLevels: Map<number, DataPoint[]>;
  batteryLevels: Map<number, DataPoint[]>;
  valvePositions: Map<number, DataPoint[]>;
  signalStrength: Map<number, DataPoint[]>;
  maxHistoryPoints: number;
}

interface DataHistoryStore extends DataHistory {
  // Actions
  addWaterLevel: (nodeId: number, value: number) => void;
  addBatteryLevel: (nodeId: number, value: number) => void;
  addValvePosition: (nodeId: number, value: number) => void;
  addSignalStrength: (nodeId: number, value: number) => void;
  getWaterLevelHistory: (nodeId: number, maxPoints?: number) => DataPoint[];
  getBatteryHistory: (nodeId: number, maxPoints?: number) => DataPoint[];
  getValveHistory: (nodeId: number, maxPoints?: number) => DataPoint[];
  getSignalHistory: (nodeId: number, maxPoints?: number) => DataPoint[];
  clearHistory: (nodeId?: number) => void;
}

export const useDataHistoryStore = create<DataHistoryStore>((set, get) => ({
  waterLevels: new Map(),
  batteryLevels: new Map(),
  valvePositions: new Map(),
  signalStrength: new Map(),
  maxHistoryPoints: 100,

  addWaterLevel: (nodeId, value) =>
    set((state) => {
      const newLevels = new Map(state.waterLevels);
      const history = newLevels.get(nodeId) || [];
      const newPoint: DataPoint = { timestamp: Date.now(), value, nodeId };

      history.push(newPoint);
      // Keep only the last maxHistoryPoints
      if (history.length > state.maxHistoryPoints) {
        history.shift();
      }

      newLevels.set(nodeId, history);
      return { waterLevels: newLevels };
    }),

  addBatteryLevel: (nodeId, value) =>
    set((state) => {
      const newLevels = new Map(state.batteryLevels);
      const history = newLevels.get(nodeId) || [];
      const newPoint: DataPoint = { timestamp: Date.now(), value, nodeId };

      history.push(newPoint);
      if (history.length > state.maxHistoryPoints) {
        history.shift();
      }

      newLevels.set(nodeId, history);
      return { batteryLevels: newLevels };
    }),

  addValvePosition: (nodeId, value) =>
    set((state) => {
      const newPositions = new Map(state.valvePositions);
      const history = newPositions.get(nodeId) || [];
      const newPoint: DataPoint = { timestamp: Date.now(), value, nodeId };

      history.push(newPoint);
      if (history.length > state.maxHistoryPoints) {
        history.shift();
      }

      newPositions.set(nodeId, history);
      return { valvePositions: newPositions };
    }),

  addSignalStrength: (nodeId, value) =>
    set((state) => {
      const newSignals = new Map(state.signalStrength);
      const history = newSignals.get(nodeId) || [];
      const newPoint: DataPoint = { timestamp: Date.now(), value, nodeId };

      history.push(newPoint);
      if (history.length > state.maxHistoryPoints) {
        history.shift();
      }

      newSignals.set(nodeId, history);
      return { signalStrength: newSignals };
    }),

  getWaterLevelHistory: (nodeId, maxPoints) => {
    const history = get().waterLevels.get(nodeId) || [];
    return maxPoints ? history.slice(-maxPoints) : history;
  },

  getBatteryHistory: (nodeId, maxPoints) => {
    const history = get().batteryLevels.get(nodeId) || [];
    return maxPoints ? history.slice(-maxPoints) : history;
  },

  getValveHistory: (nodeId, maxPoints) => {
    const history = get().valvePositions.get(nodeId) || [];
    return maxPoints ? history.slice(-maxPoints) : history;
  },

  getSignalHistory: (nodeId, maxPoints) => {
    const history = get().signalStrength.get(nodeId) || [];
    return maxPoints ? history.slice(-maxPoints) : history;
  },

  clearHistory: (nodeId) =>
    set((state) => {
      if (nodeId !== undefined) {
        const newLevels = new Map(state.waterLevels);
        const newBattery = new Map(state.batteryLevels);
        const newValves = new Map(state.valvePositions);
        const newSignals = new Map(state.signalStrength);

        newLevels.delete(nodeId);
        newBattery.delete(nodeId);
        newValves.delete(nodeId);
        newSignals.delete(nodeId);

        return {
          waterLevels: newLevels,
          batteryLevels: newBattery,
          valvePositions: newValves,
          signalStrength: newSignals,
        };
      } else {
        return {
          waterLevels: new Map(),
          batteryLevels: new Map(),
          valvePositions: new Map(),
          signalStrength: new Map(),
        };
      }
    }),
}));