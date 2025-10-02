/**
 * Farm Hierarchy Store
 * Manages Farm > Zone > Field > Node structure
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Farm, Zone, Field } from '@/types/agriculture';

interface FarmState {
  farms: Map<string, Farm>;
  zones: Map<string, Zone>;
  fields: Map<string, Field>;
  selectedFarmId: string | null;
  selectedZoneId: string | null;
  selectedFieldId: string | null;

  // Farm actions
  addFarm: (farm: Omit<Farm, 'id' | 'createdAt' | 'updatedAt' | 'zones'>) => string;
  updateFarm: (id: string, updates: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  getFarm: (id: string) => Farm | undefined;
  selectFarm: (id: string | null) => void;

  // Zone actions
  addZone: (farmId: string, zone: Omit<Zone, 'id' | 'farmId' | 'createdAt' | 'updatedAt' | 'fields'>) => string;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  getZone: (id: string) => Zone | undefined;
  getZonesByFarm: (farmId: string) => Zone[];
  selectZone: (id: string | null) => void;

  // Field actions
  addField: (zoneId: string, field: Omit<Field, 'id' | 'zoneId' | 'createdAt' | 'updatedAt'>) => string;
  updateField: (id: string, updates: Partial<Field>) => void;
  deleteField: (id: string) => void;
  getField: (id: string) => Field | undefined;
  getFieldsByZone: (zoneId: string) => Field[];
  selectField: (id: string | null) => void;

  // Node association
  addNodeToField: (fieldId: string, nodeId: string) => void;
  removeNodeFromField: (fieldId: string, nodeId: string) => void;

  // Utility
  clear: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      farms: new Map(),
      zones: new Map(),
      fields: new Map(),
      selectedFarmId: null,
      selectedZoneId: null,
      selectedFieldId: null,

      // ========================================
      // FARM ACTIONS
      // ========================================
      addFarm: (farmData) => {
        const id = generateId('farm');
        const farm: Farm = {
          ...farmData,
          id,
          zones: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newFarms = new Map(state.farms);
          newFarms.set(id, farm);
          return { farms: newFarms };
        });

        return id;
      },

      updateFarm: (id, updates) => {
        set((state) => {
          const newFarms = new Map(state.farms);
          const existing = newFarms.get(id);
          if (existing) {
            newFarms.set(id, {
              ...existing,
              ...updates,
              updatedAt: Date.now(),
            });
          }
          return { farms: newFarms };
        });
      },

      deleteFarm: (id) => {
        // Also delete all zones and fields in this farm
        const zones = get().getZonesByFarm(id);
        zones.forEach(zone => get().deleteZone(zone.id));

        set((state) => {
          const newFarms = new Map(state.farms);
          newFarms.delete(id);
          return {
            farms: newFarms,
            selectedFarmId: state.selectedFarmId === id ? null : state.selectedFarmId,
          };
        });
      },

      getFarm: (id) => get().farms.get(id),

      selectFarm: (id) => set({ selectedFarmId: id }),

      // ========================================
      // ZONE ACTIONS
      // ========================================
      addZone: (farmId, zoneData) => {
        const id = generateId('zone');
        const zone: Zone = {
          ...zoneData,
          id,
          farmId,
          fields: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newZones = new Map(state.zones);
          newZones.set(id, zone);

          // Update farm's zones array
          const newFarms = new Map(state.farms);
          const farm = newFarms.get(farmId);
          if (farm) {
            farm.zones.push(zone);
            farm.updatedAt = Date.now();
          }

          return { zones: newZones, farms: newFarms };
        });

        return id;
      },

      updateZone: (id, updates) => {
        set((state) => {
          const newZones = new Map(state.zones);
          const existing = newZones.get(id);
          if (existing) {
            newZones.set(id, {
              ...existing,
              ...updates,
              updatedAt: Date.now(),
            });
          }
          return { zones: newZones };
        });
      },

      deleteZone: (id) => {
        // Also delete all fields in this zone
        const fields = get().getFieldsByZone(id);
        fields.forEach(field => get().deleteField(field.id));

        const zone = get().zones.get(id);

        set((state) => {
          const newZones = new Map(state.zones);
          newZones.delete(id);

          // Remove from farm's zones array
          if (zone) {
            const newFarms = new Map(state.farms);
            const farm = newFarms.get(zone.farmId);
            if (farm) {
              farm.zones = farm.zones.filter(z => z.id !== id);
              farm.updatedAt = Date.now();
            }
          }

          return {
            zones: newZones,
            selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId,
          };
        });
      },

      getZone: (id) => get().zones.get(id),

      getZonesByFarm: (farmId) => {
        return Array.from(get().zones.values()).filter(z => z.farmId === farmId);
      },

      selectZone: (id) => set({ selectedZoneId: id }),

      // ========================================
      // FIELD ACTIONS
      // ========================================
      addField: (zoneId, fieldData) => {
        const id = generateId('field');
        const field: Field = {
          ...fieldData,
          id,
          zoneId,
          nodes: fieldData.nodes || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newFields = new Map(state.fields);
          newFields.set(id, field);

          // Update zone's fields array
          const newZones = new Map(state.zones);
          const zone = newZones.get(zoneId);
          if (zone) {
            zone.fields.push(field);
            zone.updatedAt = Date.now();
          }

          return { fields: newFields, zones: newZones };
        });

        return id;
      },

      updateField: (id, updates) => {
        set((state) => {
          const newFields = new Map(state.fields);
          const existing = newFields.get(id);
          if (existing) {
            newFields.set(id, {
              ...existing,
              ...updates,
              updatedAt: Date.now(),
            });
          }
          return { fields: newFields };
        });
      },

      deleteField: (id) => {
        const field = get().fields.get(id);

        set((state) => {
          const newFields = new Map(state.fields);
          newFields.delete(id);

          // Remove from zone's fields array
          if (field) {
            const newZones = new Map(state.zones);
            const zone = newZones.get(field.zoneId);
            if (zone) {
              zone.fields = zone.fields.filter(f => f.id !== id);
              zone.updatedAt = Date.now();
            }
          }

          return {
            fields: newFields,
            selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
          };
        });
      },

      getField: (id) => get().fields.get(id),

      getFieldsByZone: (zoneId) => {
        return Array.from(get().fields.values()).filter(f => f.zoneId === zoneId);
      },

      selectField: (id) => set({ selectedFieldId: id }),

      // ========================================
      // NODE ASSOCIATION
      // ========================================
      addNodeToField: (fieldId, nodeId) => {
        set((state) => {
          const newFields = new Map(state.fields);
          const field = newFields.get(fieldId);
          if (field && !field.nodes.includes(nodeId)) {
            field.nodes.push(nodeId);
            field.updatedAt = Date.now();
          }
          return { fields: newFields };
        });
      },

      removeNodeFromField: (fieldId, nodeId) => {
        set((state) => {
          const newFields = new Map(state.fields);
          const field = newFields.get(fieldId);
          if (field) {
            field.nodes = field.nodes.filter(n => n !== nodeId);
            field.updatedAt = Date.now();
          }
          return { fields: newFields };
        });
      },

      // ========================================
      // UTILITY
      // ========================================
      clear: () => {
        set({
          farms: new Map(),
          zones: new Map(),
          fields: new Map(),
          selectedFarmId: null,
          selectedZoneId: null,
          selectedFieldId: null,
        });
      },
    }),
    {
      name: 'gatemesh-farm-hierarchy',
      partialize: (state) => ({
        farms: Array.from(state.farms.entries()),
        zones: Array.from(state.zones.entries()),
        fields: Array.from(state.fields.entries()),
        selectedFarmId: state.selectedFarmId,
        selectedZoneId: state.selectedZoneId,
        selectedFieldId: state.selectedFieldId,
      }),
      // Custom hydration to restore Maps
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.farms = new Map(state.farms as any);
          state.zones = new Map(state.zones as any);
          state.fields = new Map(state.fields as any);
        }
      },
    }
  )
);
