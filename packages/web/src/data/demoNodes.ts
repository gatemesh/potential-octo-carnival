/**
 * Demo Nodes for Testing
 * Creates 15 diverse nodes with realistic configurations
 */

import { GateMeshNode, NodeType, NodeCategory, MeshRole, NodeState } from '@/types/agriculture';

export function createDemoNodes(): Omit<GateMeshNode, 'createdAt' | 'updatedAt'>[] {
  const now = Date.now();

  return [
    // ========================================
    // WATER MANAGEMENT (5 nodes)
    // ========================================
    {
      id: 'demo-node-001',
      name: 'Reservoir Level Monitor',
      hardware: 'ESP32-S3',
      roles: [NodeType.WATER_LEVEL_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 92,
      signal: -52,
      meshRole: MeshRole.COORDINATOR,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-north',
        zoneId: 'zone-1',
        name: 'Main Reservoir',
        gps: { lat: 40.7128, lng: -74.0060 },
      },
      detectedSensors: [
        { type: 'ultrasonic', model: 'HC-SR04', detected: true },
        { type: 'temperature', model: 'DS18B20', detected: true },
      ],
    },
    {
      id: 'demo-node-002',
      name: 'Headgate Controller #1',
      hardware: 'ESP32-S3',
      roles: [NodeType.HEADGATE_CONTROLLER, NodeType.GATE_VALVE],
      category: NodeCategory.CONTROLLER,
      status: NodeState.ACTIVE,
      battery: 78,
      signal: -58,
      meshRole: MeshRole.ROUTER,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-north',
        zoneId: 'zone-1',
        name: 'North Field Headgate',
        gps: { lat: 40.7135, lng: -74.0055 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 75,
        targetPosition: 75,
      },
    },
    {
      id: 'demo-node-003',
      name: 'Flow Sensor Alpha',
      hardware: 'ESP32-S3',
      roles: [NodeType.FLOW_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 84,
      signal: -61,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-north',
        zoneId: 'zone-1',
        name: 'Main Pipeline Flow',
        gps: { lat: 40.7140, lng: -74.0050 },
      },
      detectedSensors: [
        { type: 'flow', model: 'YF-S201', detected: true },
      ],
    },
    {
      id: 'demo-node-004',
      name: 'Pump Station #1',
      hardware: 'ESP32-S3',
      roles: [NodeType.PUMP_CONTROLLER, NodeType.PUMP_RELAY],
      category: NodeCategory.CONTROLLER,
      status: NodeState.ACTIVE,
      battery: 88,
      signal: -55,
      meshRole: MeshRole.ROUTER,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-north',
        zoneId: 'zone-2',
        name: 'North Pump Station',
        gps: { lat: 40.7145, lng: -74.0045 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 100,
        targetPosition: 100,
      },
    },
    {
      id: 'demo-node-005',
      name: 'Pressure Monitor #1',
      hardware: 'ESP32-S3',
      roles: [NodeType.PRESSURE_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 76,
      signal: -63,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-north',
        zoneId: 'zone-2',
        name: 'Main Line Pressure',
        gps: { lat: 40.7150, lng: -74.0040 },
      },
      detectedSensors: [
        { type: 'pressure', model: 'BMP280', detected: true },
      ],
    },

    // ========================================
    // FIELD MONITORING (5 nodes)
    // ========================================
    {
      id: 'demo-node-006',
      name: 'Soil Moisture A1',
      hardware: 'ESP32-S3',
      roles: [NodeType.SOIL_MOISTURE_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 81,
      signal: -59,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-south',
        zoneId: 'zone-3',
        name: 'South Field - Plot A',
        gps: { lat: 40.7120, lng: -74.0065 },
      },
      detectedSensors: [
        { type: 'soil_moisture', model: 'Capacitive', detected: true },
        { type: 'temperature', model: 'DHT22', detected: true },
      ],
    },
    {
      id: 'demo-node-007',
      name: 'Soil Moisture A2',
      hardware: 'ESP32-S3',
      roles: [NodeType.SOIL_MOISTURE_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 73,
      signal: -67,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-south',
        zoneId: 'zone-3',
        name: 'South Field - Plot B',
        gps: { lat: 40.7115, lng: -74.0070 },
      },
      detectedSensors: [
        { type: 'soil_moisture', model: 'Capacitive', detected: true },
      ],
    },
    {
      id: 'demo-node-008',
      name: 'Weather Station',
      hardware: 'ESP32-S3',
      roles: [NodeType.WEATHER_STATION],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 95,
      signal: -48,
      meshRole: MeshRole.ROUTER,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-south',
        zoneId: 'zone-3',
        name: 'Central Weather Station',
        gps: { lat: 40.7125, lng: -74.0062 },
      },
      detectedSensors: [
        { type: 'temperature', model: 'BME280', detected: true },
        { type: 'humidity', model: 'BME280', detected: true },
        { type: 'pressure', model: 'BME280', detected: true },
      ],
    },
    {
      id: 'demo-node-009',
      name: 'Lateral Valve L1',
      hardware: 'ESP32-S3',
      roles: [NodeType.LATERAL_VALVE],
      category: NodeCategory.ACTUATOR,
      status: NodeState.ACTIVE,
      battery: 69,
      signal: -71,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-south',
        zoneId: 'zone-4',
        name: 'Lateral #1',
        gps: { lat: 40.7110, lng: -74.0075 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 0,
        targetPosition: 0,
      },
    },
    {
      id: 'demo-node-010',
      name: 'Lateral Valve L2',
      hardware: 'ESP32-S3',
      roles: [NodeType.LATERAL_VALVE],
      category: NodeCategory.ACTUATOR,
      status: NodeState.ACTIVE,
      battery: 72,
      signal: -68,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-south',
        zoneId: 'zone-4',
        name: 'Lateral #2',
        gps: { lat: 40.7105, lng: -74.0080 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 50,
        targetPosition: 50,
      },
    },

    // ========================================
    // EAST SECTION (3 nodes)
    // ========================================
    {
      id: 'demo-node-011',
      name: 'Section Controller East',
      hardware: 'ESP32-S3',
      roles: [NodeType.SECTION_CONTROLLER],
      category: NodeCategory.CONTROLLER,
      status: NodeState.ACTIVE,
      battery: 86,
      signal: -54,
      meshRole: MeshRole.ROUTER,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-east',
        zoneId: 'zone-5',
        name: 'East Section Control',
        gps: { lat: 40.7130, lng: -74.0030 },
      },
    },
    {
      id: 'demo-node-012',
      name: 'Variable Valve E1',
      hardware: 'ESP32-S3',
      roles: [NodeType.VARIABLE_VALVE],
      category: NodeCategory.ACTUATOR,
      status: NodeState.ACTIVE,
      battery: 79,
      signal: -62,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-east',
        zoneId: 'zone-5',
        name: 'East Variable Valve',
        gps: { lat: 40.7132, lng: -74.0028 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 85,
        targetPosition: 85,
      },
    },
    {
      id: 'demo-node-013',
      name: 'Flow Sensor Beta',
      hardware: 'ESP32-S3',
      roles: [NodeType.FLOW_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.ACTIVE,
      battery: 82,
      signal: -60,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-east',
        zoneId: 'zone-5',
        name: 'East Pipeline Flow',
        gps: { lat: 40.7135, lng: -74.0025 },
      },
      detectedSensors: [
        { type: 'flow', model: 'YF-S201', detected: true },
      ],
    },

    // ========================================
    // OFFLINE/WARNING NODES (2 nodes)
    // ========================================
    {
      id: 'demo-node-014',
      name: 'Remote Sensor #1',
      hardware: 'ESP32-S3',
      roles: [NodeType.SOIL_MOISTURE_SENSOR],
      category: NodeCategory.SENSOR,
      status: NodeState.WARNING,
      battery: 15,
      signal: -89,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-west',
        zoneId: 'zone-6',
        name: 'Remote West Plot',
        gps: { lat: 40.7100, lng: -74.0090 },
      },
      detectedSensors: [
        { type: 'soil_moisture', model: 'Capacitive', detected: true },
      ],
    },
    {
      id: 'demo-node-015',
      name: 'Gate Valve West',
      hardware: 'ESP32-S3',
      roles: [NodeType.GATE_VALVE],
      category: NodeCategory.ACTUATOR,
      status: NodeState.OFFLINE,
      battery: 0,
      signal: -99,
      meshRole: MeshRole.CLIENT,
      location: {
        farmId: 'farm-1',
        fieldId: 'field-west',
        zoneId: 'zone-6',
        name: 'West Gate',
        gps: { lat: 40.7095, lng: -74.0095 },
      },
      valveControl: {
        hasValve: true,
        valvePosition: 0,
        targetPosition: 0,
      },
    },
  ];
}
