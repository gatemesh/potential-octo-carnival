/**
 * Irrigation Path Store
 * Manages water flow paths for irrigation systems
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IrrigationPath, IrrigationPathNode, PathConnection, IrrigationSchedule } from '@/types/agriculture';

interface PathStore {
  paths: Map<string, IrrigationPath>;
  selectedPathId: string | null;

  // Actions
  addPath: (path: Omit<IrrigationPath, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePath: (id: string, updates: Partial<IrrigationPath>) => void;
  deletePath: (id: string) => void;
  getPath: (id: string) => IrrigationPath | undefined;
  selectPath: (id: string | null) => void;

  // Path queries
  getPathsByFarm: (farmId: string) => IrrigationPath[];
  getPathsByZone: (zoneId: string) => IrrigationPath[];
  getActivePaths: () => IrrigationPath[];

  // Node management
  addNodeToPath: (pathId: string, node: IrrigationPathNode) => void;
  updatePathNode: (pathId: string, nodeId: string, updates: Partial<IrrigationPathNode>) => void;
  removeNodeFromPath: (pathId: string, nodeId: string) => void;
  reorderPathNodes: (pathId: string, nodeIds: string[]) => void;

  // Connection management
  addConnection: (pathId: string, connection: PathConnection) => void;
  removeConnection: (pathId: string, from: string, to: string) => void;

  // Flow control
  startFlow: (pathId: string) => void;
  stopFlow: (pathId: string) => void;
  updateFlowMetrics: (pathId: string, metrics: Partial<Pick<IrrigationPath, 'totalFlowRate' | 'totalPressure'>>) => void;

  // Schedule management
  addSchedule: (pathId: string, schedule: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSchedule: (pathId: string, scheduleId: string, updates: Partial<IrrigationSchedule>) => void;
  deleteSchedule: (pathId: string, scheduleId: string) => void;

  // Utility
  clear: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const usePathStore = create<PathStore>()(
  persist(
    (set, get) => ({
      paths: new Map(),
      selectedPathId: null,

      // ========================================
      // BASIC ACTIONS
      // ========================================
      addPath: (pathData) => {
        const id = generateId('path');
        const path: IrrigationPath = {
          ...pathData,
          id,
          isFlowing: false,
          status: 'idle',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newPaths = new Map(state.paths);
          newPaths.set(id, path);
          return { paths: newPaths };
        });

        return id;
      },

      updatePath: (id, updates) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const existing = newPaths.get(id);
          if (existing) {
            newPaths.set(id, {
              ...existing,
              ...updates,
              updatedAt: Date.now(),
            });
          }
          return { paths: newPaths };
        });
      },

      deletePath: (id) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          newPaths.delete(id);
          return {
            paths: newPaths,
            selectedPathId: state.selectedPathId === id ? null : state.selectedPathId,
          };
        });
      },

      getPath: (id) => get().paths.get(id),

      selectPath: (id) => set({ selectedPathId: id }),

      // ========================================
      // QUERIES
      // ========================================
      getPathsByFarm: (farmId) => {
        return Array.from(get().paths.values()).filter(p => p.farmId === farmId);
      },

      getPathsByZone: (zoneId) => {
        return Array.from(get().paths.values()).filter(p => p.zoneId === zoneId);
      },

      getActivePaths: () => {
        return Array.from(get().paths.values()).filter(p => p.isFlowing);
      },

      // ========================================
      // NODE MANAGEMENT
      // ========================================
      addNodeToPath: (pathId, node) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            path.nodes.push(node);
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      updatePathNode: (pathId, nodeId, updates) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            const nodeIndex = path.nodes.findIndex(n => n.nodeId === nodeId);
            if (nodeIndex !== -1) {
              path.nodes[nodeIndex] = { ...path.nodes[nodeIndex], ...updates };
              path.updatedAt = Date.now();
            }
          }
          return { paths: newPaths };
        });
      },

      removeNodeFromPath: (pathId, nodeId) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            path.nodes = path.nodes.filter(n => n.nodeId !== nodeId);
            // Also remove any connections involving this node
            path.connections = path.connections.filter(
              c => c.from !== nodeId && c.to !== nodeId
            );
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      reorderPathNodes: (pathId, nodeIds) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            // Reorder nodes based on provided array
            const nodeMap = new Map(path.nodes.map(n => [n.nodeId, n]));
            path.nodes = nodeIds.map((id, index) => {
              const node = nodeMap.get(id);
              return node ? { ...node, order: index } : node!;
            }).filter(Boolean);
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      // ========================================
      // CONNECTION MANAGEMENT
      // ========================================
      addConnection: (pathId, connection) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            // Check if connection already exists
            const exists = path.connections.some(
              c => c.from === connection.from && c.to === connection.to
            );
            if (!exists) {
              path.connections.push(connection);
              path.updatedAt = Date.now();
            }
          }
          return { paths: newPaths };
        });
      },

      removeConnection: (pathId, from, to) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            path.connections = path.connections.filter(
              c => !(c.from === from && c.to === to)
            );
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      // ========================================
      // FLOW CONTROL
      // ========================================
      startFlow: (pathId) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            path.isFlowing = true;
            path.status = 'active';
            path.lastActivated = Date.now();
            path.updatedAt = Date.now();
            // Mark connections as flowing
            path.connections.forEach(c => c.isFlowing = true);
          }
          return { paths: newPaths };
        });
      },

      stopFlow: (pathId) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            path.isFlowing = false;
            path.status = 'idle';
            path.updatedAt = Date.now();
            // Mark connections as not flowing
            path.connections.forEach(c => c.isFlowing = false);
          }
          return { paths: newPaths };
        });
      },

      updateFlowMetrics: (pathId, metrics) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            Object.assign(path, metrics);
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      // ========================================
      // SCHEDULE MANAGEMENT
      // ========================================
      addSchedule: (pathId, scheduleData) => {
        const scheduleId = generateId('schedule');
        const schedule: IrrigationSchedule = {
          ...scheduleData,
          id: scheduleId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path) {
            if (!path.schedules) path.schedules = [];
            path.schedules.push(schedule);
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });

        return scheduleId;
      },

      updateSchedule: (pathId, scheduleId, updates) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path && path.schedules) {
            const scheduleIndex = path.schedules.findIndex((s) => s.id === scheduleId);
            if (scheduleIndex !== -1) {
              path.schedules[scheduleIndex] = {
                ...path.schedules[scheduleIndex],
                ...updates,
                updatedAt: Date.now(),
              };
              path.updatedAt = Date.now();
            }
          }
          return { paths: newPaths };
        });
      },

      deleteSchedule: (pathId, scheduleId) => {
        set((state) => {
          const newPaths = new Map(state.paths);
          const path = newPaths.get(pathId);
          if (path && path.schedules) {
            path.schedules = path.schedules.filter((s) => s.id !== scheduleId);
            path.updatedAt = Date.now();
          }
          return { paths: newPaths };
        });
      },

      // ========================================
      // UTILITY
      // ========================================
      clear: () => {
        set({ paths: new Map(), selectedPathId: null });
      },
    }),
    {
      name: 'gatemesh-irrigation-paths',
      partialize: (state) => ({
        paths: Array.from(state.paths.entries()),
        selectedPathId: state.selectedPathId,
      }),
      // Custom hydration to restore Maps
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.paths = new Map(state.paths as any);
        }
      },
    }
  )
);
