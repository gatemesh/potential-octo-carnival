export enum NodeType {
  UNDEFINED = 0,
  HEADGATE_CONTROLLER = 1,
  PUMP_CONTROLLER = 2,
  SECTION_CONTROLLER = 3,
  WATER_LEVEL_SENSOR = 10,
  FLOW_SENSOR = 11,
  SOIL_MOISTURE_SENSOR = 12,
  PRESSURE_SENSOR = 13,
  WEATHER_STATION = 14,
  GATE_VALVE = 20,
  VARIABLE_VALVE = 21,
  PUMP_RELAY = 22,
  LATERAL_VALVE = 23,
}

export enum MeshRole {
  CLIENT = 0,
  CLIENT_MUTE = 1,
  ROUTER = 2,
  ROUTER_CLIENT = 3,
  REPEATER = 4,
  TRACKER = 5,
  SENSOR = 6,
  TAK = 7,
  CLIENT_HIDDEN = 8,
  LOST_AND_FOUND = 9,
  TAK_TRACKER = 10,
}

export enum IrrigationState {
  OFFLINE = 0,
  IDLE = 1,
  ACTIVE = 2,
  IRRIGATING = 3,
  ERROR = 4,
  EMERGENCY_STOP = 5,
}

export interface IrrigationNode {
  nodeId: number;
  type: NodeType;
  role: MeshRole;
  zoneId: number;
  fieldId: number;
  locationName: string;
  state: IrrigationState;
  lastSeen: number;
  battery: number;
  solar: number;
  rssi: number;
}

export interface WaterLevelData {
  nodeId: number;
  level: number;          // feet
  timestamp: number;
  alertTriggered: boolean;
  temperature?: number;   // celsius
}

export interface ValveStatus {
  nodeId: number;
  position: number;       // 0-100%
  isMoving: boolean;
  state: 'open' | 'closed' | 'moving' | 'error';
  cycleCount: number;
  lastOperation: number;
}

export interface ZoneStatus {
  zoneId: number;
  name: string;
  isIrrigating: boolean;
  valveNodes: number[];
  sensorNodes: number[];
  waterUsedGallons: number;
  startTime?: number;
  duration?: number;
}