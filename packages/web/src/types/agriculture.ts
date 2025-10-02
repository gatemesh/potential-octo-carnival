/**
 * GateMesh Agriculture Node System - Complete Type Definitions
 */

// ============================================================================
// NODE CATEGORIES & TYPES
// ============================================================================

export enum NodeCategory {
  IRRIGATION = 'irrigation',
  LIVESTOCK = 'livestock',
  EQUIPMENT = 'equipment',
  BUILDING = 'building',
  CROP = 'crop',
  SPECIALIZED = 'specialized',
  PROCESSING = 'processing',
}

export enum NodeType {
  // UNDEFINED
  UNDEFINED = 0,

  // IRRIGATION SYSTEMS (1-59)
  HEADGATE_CONTROLLER = 1,
  SECTION_CONTROLLER = 2,
  PUMP_CONTROLLER = 3,
  WATER_LEVEL_SENSOR = 20,
  FLOW_SENSOR = 21,
  SOIL_MOISTURE_SENSOR = 22,
  PRESSURE_SENSOR = 23,
  WEATHER_STATION = 24,
  GATE_VALVE = 25,
  VARIABLE_VALVE = 26,
  PUMP_RELAY = 27,
  LATERAL_VALVE = 28,

  // LIVESTOCK INFRASTRUCTURE (60-119)
  WATER_TROUGH_MONITOR = 60,
  FEED_SILO_MONITOR = 61,
  AUTOMATIC_GATE = 62,
  LIVESTOCK_SCALE = 63,
  LIVESTOCK_TRACKER = 100,

  // EQUIPMENT MONITORING (120-159)
  GENERATOR_MONITOR = 120,
  TRACTOR_MONITOR = 121,
  SOLAR_PANEL_MONITOR = 123,
  FUEL_TANK_MONITOR = 125,

  // BARN & BUILDING MONITORING (160-199)
  HAY_STORAGE_MONITOR = 160,
  GRAIN_SILO_MONITOR = 161,
  CHICKEN_COOP_CONTROLLER = 162,
  GREENHOUSE_CONTROLLER = 163,

  // CROP & FIELD MONITORING (200-249)
  PLANT_HEALTH_MONITOR = 200,
  PEST_MONITOR = 202,
  HARVEST_MONITOR = 205,

  // SPECIALIZED AGRICULTURE (250-299)
  BEE_HIVE_MONITOR = 250,
  FISH_POND_MONITOR = 251,
  HYDROPONIC_CONTROLLER = 252,

  // PROCESSING & HANDLING (300-349)
  MILK_TANK_MONITOR = 300,
  GRAIN_ELEVATOR_MONITOR = 301,
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

export enum NodeState {
  OFFLINE = 0,
  IDLE = 1,
  ACTIVE = 2,
  WORKING = 3,
  ERROR = 4,
  EMERGENCY_STOP = 5,
  MAINTENANCE = 6,
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

// ============================================================================
// NODE METADATA
// ============================================================================

export interface NodeTypeMetadata {
  id: NodeType;
  name: string;
  category: NodeCategory;
  description: string;
  icon: string;
  defaultSensors?: string[];
  capabilities?: string[];
  configFields?: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'range';
  required: boolean;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
  helpText?: string;
}

// ============================================================================
// HIERARCHY STRUCTURE
// ============================================================================

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  zones: Zone[];
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Zone {
  id: string;
  farmId: string;
  name: string;
  description?: string;
  type: 'irrigation' | 'pasture' | 'crop' | 'building' | 'mixed';
  fields: Field[];
  createdAt: number;
  updatedAt: number;
}

export interface Field {
  id: string;
  zoneId: string;
  name: string;
  description?: string;
  acres?: number;
  cropType?: string;
  nodes: string[]; // Node IDs
  boundary?: {
    lat: number;
    lng: number;
  }[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// NODE DEFINITION
// ============================================================================

export interface GateMeshNode {
  // Identity
  id: string; // Generated on flash (e.g., "GateMesh-A3F9")
  userGivenName?: string; // User-friendly name (e.g., "North Field Sensor")

  // Roles (multi-role support)
  nodeTypes: NodeType[]; // Can have multiple roles
  meshRole: MeshRole;

  // Hierarchy
  farmId?: string;
  zoneId?: string;
  fieldId?: string;

  // Location
  location?: {
    lat: number;
    lng: number;
    elevation?: number;
    accuracy?: number;
  };

  // Status
  state: NodeState;
  lastSeen: number;
  isOnline: boolean;

  // Hardware
  hardwareId: string; // ESP32 chip ID
  firmwareVersion: string;
  battery: number; // Percentage
  batteryVoltage?: number;
  solar?: number; // Voltage
  isCharging?: boolean;

  // Network
  rssi: number;
  snr?: number;
  hopCount?: number;
  parentNode?: string;
  childNodes?: string[];

  // Configuration
  config: NodeConfig;

  // Sensors (auto-detected)
  detectedSensors?: DetectedSensor[];

  // Metadata
  createdAt: number;
  updatedAt: number;
  installedAt?: number;
  notes?: string;
}

export interface NodeConfig {
  // General
  reportingInterval?: number; // seconds
  sleepMode?: boolean;

  // Alerts
  alertThresholds?: Record<string, AlertThreshold>;

  // Type-specific configs (extensible)
  [key: string]: any;
}

export interface AlertThreshold {
  enabled: boolean;
  min?: number;
  max?: number;
  operator?: 'lt' | 'gt' | 'eq' | 'between';
  value?: number;
  message?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DetectedSensor {
  type: string;
  port: string; // Grove port (A0, D2, I2C, etc.)
  address?: number; // I2C address if applicable
  name: string;
  manufacturer?: string;
  model?: string;
}

// ============================================================================
// SENSOR DATA
// ============================================================================

export interface SensorReading {
  nodeId: string;
  sensorType: string;
  value: number | string | boolean;
  unit?: string;
  timestamp: number;
  quality?: number; // 0-100 data quality score
}

// Irrigation-specific
export interface WaterLevelData {
  nodeId: string;
  level: number; // feet
  timestamp: number;
  alertTriggered: boolean;
  temperature?: number;
  turbidity?: number;
}

export interface FlowData {
  nodeId: string;
  rate: number; // gallons/minute
  total: number; // total gallons
  timestamp: number;
  temperature?: number;
  pressure?: number;
}

export interface SoilMoistureData {
  nodeId: string;
  moisture: number; // percentage
  depth: number; // inches
  temperature?: number;
  timestamp: number;
}

export interface ValveStatus {
  nodeId: string;
  position: number; // 0-100%
  isMoving: boolean;
  state: 'open' | 'closed' | 'moving' | 'error';
  cycleCount: number;
  lastOperation: number;
}

// Livestock-specific
export interface TroughStatus {
  nodeId: string;
  waterLevel: number; // percentage
  temperature: number;
  tds: number; // total dissolved solids
  turbidity: number;
  lastRefill: number;
  isRefilling: boolean;
}

export interface LivestockHealth {
  nodeId: string;
  animalId: string;
  temperature: number;
  heartRate?: number;
  activity: number; // steps or movement score
  location: { lat: number; lng: number };
  alerts: string[];
  timestamp: number;
}

// Equipment-specific
export interface GeneratorStatus {
  nodeId: string;
  isRunning: boolean;
  load: number; // percentage
  fuelLevel: number; // percentage
  runtime: number; // hours
  temperature: number;
  vibration: number;
  alerts: string[];
  timestamp: number;
}

// ============================================================================
// NETWORK TOPOLOGY
// ============================================================================

export interface NetworkTopology {
  nodes: TopologyNode[];
  links: TopologyLink[];
  lastUpdated: number;
}

export interface TopologyNode {
  id: string;
  name: string;
  role: MeshRole;
  rssi: number;
  battery: number;
  isOnline: boolean;
  location?: { lat: number; lng: number };
}

export interface TopologyLink {
  source: string; // node ID
  target: string; // node ID
  rssi: number;
  quality: number; // 0-100
  hopCount: number;
}

// ============================================================================
// IRRIGATION FLOW PATHS
// ============================================================================

export interface IrrigationPath {
  id: string;
  name: string;
  description?: string;
  farmId: string;
  zoneId?: string;
  nodes: IrrigationPathNode[];
  connections: PathConnection[];
  status: 'idle' | 'active' | 'error' | 'maintenance';
  isFlowing: boolean;

  // Flow metrics
  totalFlowRate?: number; // gallons per minute
  totalPressure?: number; // PSI
  totalVolumeToday?: number; // gallons

  // Configuration
  maxFlowRate?: number;
  targetPressure?: number;

  // Scheduling
  schedules?: IrrigationSchedule[];

  // Metadata
  createdAt: number;
  updatedAt: number;
  lastActivated?: number;
}

export interface IrrigationPathNode {
  nodeId: string;
  order: number; // Position in flow path (0 = source)
  type: 'source' | 'pump' | 'valve' | 'sensor' | 'junction' | 'endpoint';
  status: 'ok' | 'warning' | 'error' | 'offline';

  // Position for visualization
  position?: {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
  };

  // Current state
  isActive?: boolean;
  flowRate?: number; // GPM at this point
  pressure?: number; // PSI at this point
}

export interface PathConnection {
  from: string; // nodeId
  to: string; // nodeId
  type: 'pipe' | 'canal' | 'underground';
  size?: number; // inches
  length?: number; // feet
  isFlowing?: boolean;
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  enabled: boolean;

  // Time settings
  startTime: string; // HH:MM format (24-hour)
  duration: number; // minutes

  // Recurrence
  repeat: 'once' | 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for weekly/custom)
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string (optional)

  // Status
  lastRun?: number; // timestamp
  nextRun?: number; // timestamp
  runCount?: number;

  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// NETWORK TOPOLOGY
// ============================================================================

export interface MeshConnection {
  from: string; // nodeId
  to: string; // nodeId
  signalStrength: number; // dBm (e.g., -60)
  hopCount: number;
  latency?: number; // ms
  packetLoss?: number; // percentage
  isActive: boolean;
  lastSeen?: Date;
}

export interface NetworkNode {
  id: string;
  name: string;
  roles: NodeType[];
  category: NodeCategory;
  position?: { x: number; y: number };
  meshRole: 'router' | 'client' | 'coordinator';
  status: 'online' | 'offline' | 'warning';
  battery?: number; // percentage
  uptime?: number; // seconds
  connections: string[]; // array of connected node IDs
  signalQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MeshNetworkTopology {
  nodes: NetworkNode[];
  connections: MeshConnection[];
  coordinatorId?: string;
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  averageSignalStrength: number;
  lastUpdated: Date;
}

export type TopologyLayout = 'force' | 'hierarchical' | 'circular' | 'geographic';

export interface TopologyFilter {
  categories?: NodeCategory[];
  status?: ('online' | 'offline' | 'warning')[];
  meshRole?: ('router' | 'client' | 'coordinator')[];
  minSignalStrength?: number;
}

export enum PathNodeType {
  SOURCE = 'source',           // Reservoir, canal headgate
  PUMP = 'pump',              // Pump controller
  VALVE = 'valve',            // Gate valve, control valve
  SENSOR = 'sensor',          // Flow sensor, pressure sensor
  JUNCTION = 'junction',      // Pipe junction, splitter
  ENDPOINT = 'endpoint',      // Field delivery point
}

// ============================================================================
// USER & PERMISSIONS
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  farms: string[]; // Farm IDs user has access to
  permissions: Permission[];
  mqttEnabled?: boolean; // For admin users
  createdAt: number;
  lastLogin?: number;
}

export interface Permission {
  resource: string; // 'nodes', 'config', 'users', etc.
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface NodeTemplate {
  id: string;
  name: string;
  description?: string;
  category: NodeCategory;
  nodeTypes: NodeType[];
  meshRole: MeshRole;
  config: NodeConfig;
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: number;
}

// ============================================================================
// ALERTS & NOTIFICATIONS
// ============================================================================

export interface Alert {
  id: string;
  nodeId: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
}

// ============================================================================
// OFFLINE SUPPORT
// ============================================================================

export interface OfflineCommand {
  id: string;
  nodeId: string;
  command: string;
  params: any;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}
