/**
 * Node Store - Manages all GateMesh nodes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GateMeshNode, NodeType, NodeCategory, MeshRole, NodeState, DetectedSensor } from '@/types/agriculture';

interface NodeStore {
  nodes: Map<string, GateMeshNode>;
  selectedNodeId: string | null;

  // Actions
  addNode: (node: Omit<GateMeshNode, 'createdAt' | 'updatedAt'>) => void;
  updateNode: (nodeId: string, updates: Partial<GateMeshNode>) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  getNode: (nodeId: string) => GateMeshNode | undefined;

  // Queries
  getNodesByType: (type: NodeType) => GateMeshNode[];
  getNodesByCategory: (category: NodeCategory) => GateMeshNode[];
  getNodesByMeshRole: (role: MeshRole) => GateMeshNode[];
  getNodesByFarm: (farmId: string) => GateMeshNode[];
  getNodesByZone: (zoneId: string) => GateMeshNode[];
  getNodesByField: (fieldId: string) => GateMeshNode[];
  getOnlineNodes: () => GateMeshNode[];
  getOfflineNodes: () => GateMeshNode[];
  searchNodes: (query: string) => GateMeshNode[];

  // Multi-role support
  addNodeType: (nodeId: string, type: NodeType) => void;
  removeNodeType: (nodeId: string, type: NodeType) => void;

  // Sensor detection
  updateDetectedSensors: (nodeId: string, sensors: DetectedSensor[]) => void;

  // Utility
  clear: () => void;
}

export const useNodeStore = create<NodeStore>()(
  persist(
    (set, get) => ({
      nodes: new Map(),
      selectedNodeId: null,

      // ========================================
      // BASIC ACTIONS
      // ========================================
      addNode: (nodeData) => {
        const node: GateMeshNode = {
          ...nodeData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newNodes = new Map(state.nodes);
          newNodes.set(node.id, node);
          return { nodes: newNodes };
        });
      },

      updateNode: (nodeId, updates) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const existing = newNodes.get(nodeId);
          if (existing) {
            newNodes.set(nodeId, {
              ...existing,
              ...updates,
              updatedAt: Date.now(),
            });
          }
          return { nodes: newNodes };
        });
      },

      removeNode: (nodeId) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          newNodes.delete(nodeId);
          return {
            nodes: newNodes,
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          };
        });
      },

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      getNode: (nodeId) => get().nodes.get(nodeId),

      // ========================================
      // QUERIES
      // ========================================
      getNodesByType: (type) => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.nodeTypes.includes(type)
        );
      },

      getNodesByCategory: (category) => {
        // This requires importing NODE_CATALOG to map types to categories
        // For now, we'll filter based on type ranges
        const categoryRanges: Record<NodeCategory, [number, number]> = {
          irrigation: [1, 59],
          livestock: [60, 119],
          equipment: [120, 159],
          building: [160, 199],
          crop: [200, 249],
          specialized: [250, 299],
          processing: [300, 349],
        };

        const [min, max] = categoryRanges[category];
        return Array.from(get().nodes.values()).filter((node) =>
          node.nodeTypes.some(type => type >= min && type <= max)
        );
      },

      getNodesByMeshRole: (role) => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.meshRole === role
        );
      },

      getNodesByFarm: (farmId) => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.farmId === farmId
        );
      },

      getNodesByZone: (zoneId) => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.zoneId === zoneId
        );
      },

      getNodesByField: (fieldId) => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.fieldId === fieldId
        );
      },

      getOnlineNodes: () => {
        return Array.from(get().nodes.values()).filter((node) =>
          node.isOnline
        );
      },

      getOfflineNodes: () => {
        return Array.from(get().nodes.values()).filter((node) =>
          !node.isOnline
        );
      },

      searchNodes: (query) => {
        const lowerQuery = query.toLowerCase();
        return Array.from(get().nodes.values()).filter((node) =>
          node.id.toLowerCase().includes(lowerQuery) ||
          node.userGivenName?.toLowerCase().includes(lowerQuery) ||
          node.notes?.toLowerCase().includes(lowerQuery)
        );
      },

      // ========================================
      // MULTI-ROLE SUPPORT
      // ========================================
      addNodeType: (nodeId, type) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);
          if (node && !node.nodeTypes.includes(type)) {
            node.nodeTypes.push(type);
            node.updatedAt = Date.now();
          }
          return { nodes: newNodes };
        });
      },

      removeNodeType: (nodeId, type) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);
          if (node) {
            node.nodeTypes = node.nodeTypes.filter(t => t !== type);
            node.updatedAt = Date.now();
          }
          return { nodes: newNodes };
        });
      },

      // ========================================
      // SENSOR DETECTION
      // ========================================
      updateDetectedSensors: (nodeId, sensors) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const node = newNodes.get(nodeId);
          if (node) {
            node.detectedSensors = sensors;
            node.updatedAt = Date.now();
          }
          return { nodes: newNodes };
        });
      },

      // ========================================
      // UTILITY
      // ========================================
      clear: () => {
        set({ nodes: new Map(), selectedNodeId: null });
      },
    }),
    {
      name: 'gatemesh-nodes',
      partialize: (state) => ({
        nodes: Array.from(state.nodes.entries()),
        selectedNodeId: state.selectedNodeId,
      }),
      // Custom hydration to restore Maps
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.nodes = new Map(state.nodes as any);
        }
      },
    }
  )
);

/**
 * Generate a random node ID (used when flashing firmware)
 */
export function generateNodeId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GateMesh-${id}`;
}

/**
 * Create a new unconfigured node
 */
export function createUnconfiguredNode(hardwareId: string): GateMeshNode {
  return {
    id: generateNodeId(),
    hardwareId,
    nodeTypes: [NodeType.UNDEFINED],
    meshRole: MeshRole.CLIENT,
    state: NodeState.IDLE,
    lastSeen: Date.now(),
    isOnline: true,
    battery: 100,
    rssi: -50,
    firmwareVersion: '1.0.0',
    config: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
