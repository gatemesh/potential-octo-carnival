/**
 * GateMesh Agriculture Node Catalog
 * Complete metadata for all node types
 */

import { NodeType, NodeCategory, NodeTypeMetadata } from '@/types/agriculture';

export const NODE_CATALOG: NodeTypeMetadata[] = [
  // ============================================================================
  // IRRIGATION SYSTEMS (1-59)
  // ============================================================================
  {
    id: NodeType.HEADGATE_CONTROLLER,
    name: 'Headgate Controller',
    category: NodeCategory.IRRIGATION,
    description: 'Primary irrigation system controller that manages main canal gates and coordinates water distribution across multiple zones.',
    icon: 'dam',
    capabilities: [
      'Grove servo motors for precise gate positioning',
      'Water flow sensors for monitoring throughput',
      'Pressure sensors for optimal system pressure',
      'GPS positioning for mapping integration',
      'Downstream controller coordination',
    ],
    configFields: [
      { key: 'gateCount', label: 'Number of Gates', type: 'number', required: true, defaultValue: 1, min: 1, max: 8 },
      { key: 'maxFlowRate', label: 'Max Flow Rate', type: 'number', required: true, unit: 'GPM', min: 0 },
      { key: 'pressureTarget', label: 'Target Pressure', type: 'number', required: false, unit: 'PSI', defaultValue: 30 },
    ],
  },
  {
    id: NodeType.SECTION_CONTROLLER,
    name: 'Section Controller',
    category: NodeCategory.IRRIGATION,
    description: 'Zone-specific irrigation controllers that manage individual field sections or crop areas.',
    icon: 'sprout',
    capabilities: [
      'Grove soil moisture sensors',
      'Temperature sensors',
      'Valve control relays',
      'Automated irrigation scheduling',
      'Autonomous operation during outages',
    ],
    configFields: [
      { key: 'valveCount', label: 'Number of Valves', type: 'number', required: true, defaultValue: 1, min: 1, max: 16 },
      { key: 'soilMoistureThreshold', label: 'Moisture Threshold', type: 'range', required: false, defaultValue: 50, min: 0, max: 100, unit: '%' },
      { key: 'irrigationSchedule', label: 'Schedule Enabled', type: 'boolean', required: false, defaultValue: true },
    ],
  },
  {
    id: NodeType.PUMP_CONTROLLER,
    name: 'Pump Controller',
    category: NodeCategory.IRRIGATION,
    description: 'Dedicated pump station management with efficiency monitoring and automatic control.',
    icon: 'engine',
    capabilities: [
      'Grove current sensors',
      'Vibration monitoring',
      'Pressure feedback',
      'Cavitation detection',
      'Fuel level monitoring for diesel pumps',
      'Solar charge monitoring',
    ],
    configFields: [
      { key: 'pumpType', label: 'Pump Type', type: 'select', required: true, options: [
        { value: 'electric', label: 'Electric' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'solar', label: 'Solar' },
      ]},
      { key: 'maxCurrent', label: 'Max Current', type: 'number', required: false, unit: 'A' },
      { key: 'pressureSetpoint', label: 'Pressure Setpoint', type: 'number', required: false, unit: 'PSI' },
    ],
  },
  {
    id: NodeType.WATER_LEVEL_SENSOR,
    name: 'Water Level Sensor',
    category: NodeCategory.IRRIGATION,
    description: 'Monitors water levels in canals, reservoirs, and storage tanks using ultrasonic distance sensors.',
    icon: 'droplet',
    capabilities: [
      'Grove ultrasonic distance sensors',
      'Backup float switches',
      'Temperature sensors for freeze protection',
      'Turbidity sensors for water quality',
      'Configurable alert thresholds',
    ],
    configFields: [
      { key: 'maxDepth', label: 'Max Depth', type: 'number', required: true, unit: 'ft', defaultValue: 10 },
      { key: 'lowThreshold', label: 'Low Level Alert', type: 'number', required: false, unit: 'ft', defaultValue: 2 },
      { key: 'highThreshold', label: 'High Level Alert', type: 'number', required: false, unit: 'ft', defaultValue: 8 },
    ],
  },
  {
    id: NodeType.FLOW_SENSOR,
    name: 'Flow Sensor',
    category: NodeCategory.IRRIGATION,
    description: 'Precision water flow monitoring with leak detection and flow rate maintenance.',
    icon: 'gauge',
    capabilities: [
      'Grove flow sensors (magnetic/paddle wheel)',
      'Flow rate calculation',
      'Total volume tracking',
      'Leak detection',
      'Temperature compensation',
      'Flow rate control integration',
    ],
    configFields: [
      { key: 'pipeSize', label: 'Pipe Size', type: 'number', required: true, unit: 'inches' },
      { key: 'targetFlowRate', label: 'Target Flow Rate', type: 'number', required: false, unit: 'GPM' },
      { key: 'leakThreshold', label: 'Leak Detection', type: 'number', required: false, unit: '%', defaultValue: 10 },
    ],
  },
  {
    id: NodeType.SOIL_MOISTURE_SENSOR,
    name: 'Soil Moisture Sensor',
    category: NodeCategory.IRRIGATION,
    description: 'Multi-depth soil moisture monitoring to optimize irrigation timing.',
    icon: 'thermometer',
    capabilities: [
      'Grove capacitive sensors',
      'Multi-depth monitoring',
      'Temperature sensors',
      'pH sensors for soil health',
      'Predictive irrigation scheduling',
    ],
    configFields: [
      { key: 'sensorDepths', label: 'Sensor Depths (comma-separated)', type: 'text', required: false, helpText: 'e.g., 6,12,18 inches' },
      { key: 'optimalMoisture', label: 'Optimal Moisture', type: 'range', required: false, defaultValue: 60, min: 0, max: 100, unit: '%' },
    ],
  },
  {
    id: NodeType.PRESSURE_SENSOR,
    name: 'Pressure Sensor',
    category: NodeCategory.IRRIGATION,
    description: 'System pressure monitoring for optimal operation and leak detection.',
    icon: 'gauge',
    capabilities: [
      'Grove pressure sensors',
      'System optimization',
      'Leak detection',
      'Valve coordination',
    ],
    configFields: [
      { key: 'maxPressure', label: 'Max Pressure', type: 'number', required: true, unit: 'PSI', defaultValue: 100 },
      { key: 'minPressure', label: 'Min Pressure Alert', type: 'number', required: false, unit: 'PSI', defaultValue: 20 },
    ],
  },
  {
    id: NodeType.WEATHER_STATION,
    name: 'Weather Station',
    category: NodeCategory.IRRIGATION,
    description: 'Comprehensive weather monitoring for irrigation optimization.',
    icon: 'cloud-sun',
    capabilities: [
      'Temperature/humidity sensors',
      'Barometric pressure',
      'Wind speed/direction',
      'UV sensors',
      'Rain gauge',
      'Evapotranspiration calculations',
      'Frost warnings',
    ],
    configFields: [
      { key: 'rainGaugeSize', label: 'Rain Gauge Size', type: 'select', required: false, options: [
        { value: '0.01', label: '0.01 inch' },
        { value: '0.2', label: '0.2 mm' },
      ]},
      { key: 'windHeightFt', label: 'Anemometer Height', type: 'number', required: false, unit: 'ft', defaultValue: 10 },
    ],
  },
  {
    id: NodeType.GATE_VALVE,
    name: 'Gate Valve',
    category: NodeCategory.IRRIGATION,
    description: 'Automated gate valve control for water distribution.',
    icon: 'door-open',
    capabilities: [
      'Grove servo motors',
      'Position feedback',
      'Open/close control',
      'Cycle counting',
    ],
    configFields: [
      { key: 'valveSize', label: 'Valve Size', type: 'number', required: true, unit: 'inches' },
      { key: 'operationTime', label: 'Full Operation Time', type: 'number', required: false, unit: 'seconds', defaultValue: 30 },
    ],
  },
  {
    id: NodeType.VARIABLE_VALVE,
    name: 'Variable Valve',
    category: NodeCategory.IRRIGATION,
    description: 'Proportional valve control for precise flow regulation.',
    icon: 'sliders-horizontal',
    capabilities: [
      'Variable position control (0-100%)',
      'Flow rate feedback',
      'Automated adjustments',
    ],
    configFields: [
      { key: 'valveSize', label: 'Valve Size', type: 'number', required: true, unit: 'inches' },
      { key: 'minPosition', label: 'Minimum Position', type: 'number', required: false, unit: '%', defaultValue: 10 },
    ],
  },
  {
    id: NodeType.PUMP_RELAY,
    name: 'Pump Relay',
    category: NodeCategory.IRRIGATION,
    description: 'Simple pump on/off control relay.',
    icon: 'power',
    capabilities: [
      'High-current relay control',
      'Runtime tracking',
      'Cycle counting',
    ],
    configFields: [
      { key: 'maxRuntime', label: 'Max Continuous Runtime', type: 'number', required: false, unit: 'hours', defaultValue: 8 },
    ],
  },
  {
    id: NodeType.LATERAL_VALVE,
    name: 'Lateral Valve',
    category: NodeCategory.IRRIGATION,
    description: 'Individual lateral line valve control.',
    icon: 'git-branch',
    capabilities: [
      'Grove relay control',
      'Zone isolation',
      'Automated sequencing',
    ],
    configFields: [
      { key: 'lateralLength', label: 'Lateral Length', type: 'number', required: false, unit: 'feet' },
    ],
  },

  // ============================================================================
  // LIVESTOCK INFRASTRUCTURE (60-119)
  // ============================================================================
  {
    id: NodeType.WATER_TROUGH_MONITOR,
    name: 'Water Trough Monitor',
    category: NodeCategory.LIVESTOCK,
    description: 'Smart livestock watering system with quality monitoring and automatic refill.',
    icon: 'beer',
    capabilities: [
      'Ultrasonic water level sensors',
      'Temperature sensors for freeze detection',
      'TDS sensors for water quality',
      'Turbidity monitoring',
      'Automatic refill control',
    ],
    configFields: [
      { key: 'troughCapacity', label: 'Trough Capacity', type: 'number', required: false, unit: 'gallons' },
      { key: 'refillThreshold', label: 'Refill Threshold', type: 'range', required: false, defaultValue: 30, min: 0, max: 100, unit: '%' },
      { key: 'freezeAlert', label: 'Freeze Alert Temp', type: 'number', required: false, unit: '°F', defaultValue: 35 },
    ],
  },
  {
    id: NodeType.FEED_SILO_MONITOR,
    name: 'Feed Silo Monitor',
    category: NodeCategory.LIVESTOCK,
    description: 'Automated feed storage monitoring with inventory tracking and quality monitoring.',
    icon: 'warehouse',
    capabilities: [
      'Ultrasonic distance sensors for inventory',
      'Moisture sensors to prevent spoilage',
      'Temperature sensors for hot spot detection',
      'Load cell integration',
      'Automatic ordering alerts',
    ],
    configFields: [
      { key: 'siloCapacity', label: 'Silo Capacity', type: 'number', required: false, unit: 'tons' },
      { key: 'reorderThreshold', label: 'Reorder Threshold', type: 'range', required: false, defaultValue: 20, min: 0, max: 100, unit: '%' },
    ],
  },
  {
    id: NodeType.AUTOMATIC_GATE,
    name: 'Automatic Gate',
    category: NodeCategory.LIVESTOCK,
    description: 'Pasture management with automated gate operation and animal tracking.',
    icon: 'fence',
    capabilities: [
      'Grove servo motors for gate operation',
      'PIR motion sensors',
      'Weight sensors for identification',
      'Camera modules',
      'RFID readers for tagged animals',
    ],
    configFields: [
      { key: 'gateType', label: 'Gate Type', type: 'select', required: true, options: [
        { value: 'swing', label: 'Swing Gate' },
        { value: 'slide', label: 'Slide Gate' },
      ]},
      { key: 'autoCloseDelay', label: 'Auto-Close Delay', type: 'number', required: false, unit: 'seconds', defaultValue: 30 },
    ],
  },
  {
    id: NodeType.LIVESTOCK_SCALE,
    name: 'Livestock Scale',
    category: NodeCategory.LIVESTOCK,
    description: 'Precision animal weighing with automated record keeping.',
    icon: 'scale',
    capabilities: [
      'Grove load cells',
      'RFID readers for identification',
      'Temperature sensors for health',
      'Automated weight recording',
      'Growth tracking',
    ],
    configFields: [
      { key: 'maxWeight', label: 'Max Weight', type: 'number', required: true, unit: 'lbs', defaultValue: 2000 },
      { key: 'accuracy', label: 'Accuracy', type: 'number', required: false, unit: 'lbs', defaultValue: 1 },
    ],
  },
  {
    id: NodeType.LIVESTOCK_TRACKER,
    name: 'Livestock Tracker',
    category: NodeCategory.LIVESTOCK,
    description: 'Individual animal monitoring with GPS tracking and health monitoring.',
    icon: 'map-pin',
    capabilities: [
      'Grove GPS modules',
      'Accelerometers for activity',
      'Infrared temperature sensors',
      'Heart rate sensors',
      'RFID readers',
      'Sound sensors for distress',
    ],
    configFields: [
      { key: 'trackingInterval', label: 'Tracking Interval', type: 'number', required: false, unit: 'minutes', defaultValue: 15 },
      { key: 'geofenceEnabled', label: 'Geofence Alerts', type: 'boolean', required: false, defaultValue: true },
    ],
  },

  // ============================================================================
  // EQUIPMENT MONITORING (120-159)
  // ============================================================================
  {
    id: NodeType.GENERATOR_MONITOR,
    name: 'Generator Monitor',
    category: NodeCategory.EQUIPMENT,
    description: 'Comprehensive backup generator monitoring and control.',
    icon: 'zap',
    capabilities: [
      'Vibration sensors for engine health',
      'Current sensors for load monitoring',
      'Temperature sensors',
      'Sound sensors for acoustic analysis',
      'Fuel level sensors',
      'CO sensors for safety',
      'Remote start/stop',
    ],
    configFields: [
      { key: 'generatorKW', label: 'Generator Capacity', type: 'number', required: false, unit: 'kW' },
      { key: 'fuelType', label: 'Fuel Type', type: 'select', required: true, options: [
        { value: 'diesel', label: 'Diesel' },
        { value: 'propane', label: 'Propane' },
        { value: 'natural_gas', label: 'Natural Gas' },
      ]},
    ],
  },
  {
    id: NodeType.TRACTOR_MONITOR,
    name: 'Tractor Monitor',
    category: NodeCategory.EQUIPMENT,
    description: 'Farm equipment health monitoring with predictive maintenance.',
    icon: 'truck',
    capabilities: [
      'Accelerometers for vibration analysis',
      'Temperature sensors',
      'Current sensors',
      'Oil pressure sensors',
      'GPS tracking',
      'Hour meters',
    ],
    configFields: [
      { key: 'makeModel', label: 'Make/Model', type: 'text', required: false },
      { key: 'maintenanceInterval', label: 'Maintenance Interval', type: 'number', required: false, unit: 'hours', defaultValue: 100 },
    ],
  },
  {
    id: NodeType.SOLAR_PANEL_MONITOR,
    name: 'Solar Panel Monitor',
    category: NodeCategory.EQUIPMENT,
    description: 'Solar power system optimization and monitoring.',
    icon: 'sun',
    capabilities: [
      'Light sensors for irradiance',
      'Dust sensors for cleanliness',
      'Temperature sensors',
      'Voltage/current sensors',
      'Servo motors for tracking',
    ],
    configFields: [
      { key: 'panelWatts', label: 'Panel Wattage', type: 'number', required: false, unit: 'W' },
      { key: 'trackingEnabled', label: 'Sun Tracking', type: 'boolean', required: false, defaultValue: false },
    ],
  },
  {
    id: NodeType.FUEL_TANK_MONITOR,
    name: 'Fuel Tank Monitor',
    category: NodeCategory.EQUIPMENT,
    description: 'Fuel inventory management with theft detection.',
    icon: 'fuel',
    capabilities: [
      'Ultrasonic level sensors',
      'Temperature sensors',
      'Water detection sensors',
      'Flow sensors',
      'Automatic ordering alerts',
      'Theft detection',
    ],
    configFields: [
      { key: 'tankCapacity', label: 'Tank Capacity', type: 'number', required: true, unit: 'gallons' },
      { key: 'reorderLevel', label: 'Reorder Level', type: 'range', required: false, defaultValue: 25, min: 0, max: 100, unit: '%' },
    ],
  },

  // ============================================================================
  // BARN & BUILDING MONITORING (160-199)
  // ============================================================================
  {
    id: NodeType.HAY_STORAGE_MONITOR,
    name: 'Hay Storage Monitor',
    category: NodeCategory.BUILDING,
    description: 'Fire prevention and quality monitoring for hay storage.',
    icon: 'hay-bale',
    capabilities: [
      'Temperature sensors for hot spot detection',
      'Moisture sensors for spoilage prevention',
      'Smoke sensors',
      'CO2 sensors',
      'Ultrasonic sensors for hay level',
      'Relay-controlled ventilation',
    ],
    configFields: [
      { key: 'maxSafeTemp', label: 'Max Safe Temp', type: 'number', required: false, unit: '°F', defaultValue: 150 },
      { key: 'ventilationEnabled', label: 'Auto Ventilation', type: 'boolean', required: false, defaultValue: true },
    ],
  },
  {
    id: NodeType.GRAIN_SILO_MONITOR,
    name: 'Grain Silo Monitor',
    category: NodeCategory.BUILDING,
    description: 'Grain storage management with quality and safety monitoring.',
    icon: 'silo',
    capabilities: [
      'Ultrasonic sensors for inventory',
      'Temperature sensors',
      'Moisture sensors',
      'Vibration sensors',
      'Dust sensors for explosion prevention',
    ],
    configFields: [
      { key: 'grainType', label: 'Grain Type', type: 'text', required: false },
      { key: 'siloCapacity', label: 'Silo Capacity', type: 'number', required: false, unit: 'bushels' },
    ],
  },
  {
    id: NodeType.CHICKEN_COOP_CONTROLLER,
    name: 'Chicken Coop Controller',
    category: NodeCategory.BUILDING,
    description: 'Poultry automation with climate control and security.',
    icon: 'egg',
    capabilities: [
      'Temperature/humidity sensors',
      'Light sensors for door timing',
      'Air quality sensors',
      'Weight sensors for egg counting',
      'PIR sensors for predators',
      'Servo motors for doors',
    ],
    configFields: [
      { key: 'doorOpenTime', label: 'Door Open Time', type: 'text', required: false, helpText: 'e.g., sunrise+30min' },
      { key: 'doorCloseTime', label: 'Door Close Time', type: 'text', required: false, helpText: 'e.g., sunset' },
      { key: 'targetTemp', label: 'Target Temperature', type: 'number', required: false, unit: '°F', defaultValue: 70 },
    ],
  },
  {
    id: NodeType.GREENHOUSE_CONTROLLER,
    name: 'Greenhouse Controller',
    category: NodeCategory.BUILDING,
    description: 'Complete greenhouse automation for optimal growing conditions.',
    icon: 'greenhouse',
    capabilities: [
      'Temperature/humidity sensors',
      'CO2 sensors',
      'Light sensors',
      'Soil moisture sensors (multi-zone)',
      'pH sensors for hydroponics',
      'Servo motors for vents',
      'Relay controls for irrigation, fans, lights',
    ],
    configFields: [
      { key: 'targetTemp', label: 'Target Temperature', type: 'number', required: false, unit: '°F', defaultValue: 75 },
      { key: 'targetHumidity', label: 'Target Humidity', type: 'range', required: false, defaultValue: 60, min: 0, max: 100, unit: '%' },
      { key: 'co2Enabled', label: 'CO2 Enrichment', type: 'boolean', required: false, defaultValue: false },
    ],
  },

  // ============================================================================
  // CROP & FIELD MONITORING (200-249)
  // ============================================================================
  {
    id: NodeType.PLANT_HEALTH_MONITOR,
    name: 'Plant Health Monitor',
    category: NodeCategory.CROP,
    description: 'Advanced crop monitoring with stress detection.',
    icon: 'leaf',
    capabilities: [
      'Infrared temperature sensors',
      'Light sensors',
      'Moisture sensors for leaf wetness',
      'Sound sensors for stress acoustics',
      'Accelerometers for wind damage',
    ],
    configFields: [
      { key: 'cropType', label: 'Crop Type', type: 'text', required: false },
      { key: 'growthStage', label: 'Growth Stage', type: 'select', required: false, options: [
        { value: 'seedling', label: 'Seedling' },
        { value: 'vegetative', label: 'Vegetative' },
        { value: 'flowering', label: 'Flowering' },
        { value: 'fruiting', label: 'Fruiting' },
      ]},
    ],
  },
  {
    id: NodeType.PEST_MONITOR,
    name: 'Pest Monitor',
    category: NodeCategory.CROP,
    description: 'Integrated pest management with early detection.',
    icon: 'bug',
    capabilities: [
      'PIR sensors for large pests',
      'Sound sensors for insects',
      'Camera modules for identification',
      'Temperature/humidity correlation',
      'Vibration sensors for traps',
    ],
    configFields: [
      { key: 'targetPests', label: 'Target Pests', type: 'text', required: false, helpText: 'Comma-separated list' },
      { key: 'trapType', label: 'Trap Type', type: 'select', required: false, options: [
        { value: 'pheromone', label: 'Pheromone' },
        { value: 'sticky', label: 'Sticky Trap' },
        { value: 'light', label: 'Light Trap' },
      ]},
    ],
  },
  {
    id: NodeType.HARVEST_MONITOR,
    name: 'Harvest Monitor',
    category: NodeCategory.CROP,
    description: 'Crop maturity assessment and harvest optimization.',
    icon: 'tractor',
    capabilities: [
      'Color sensors for ripeness',
      'Infrared temperature sensors',
      'Sound sensors for firmness',
      'Weight sensors for yield',
      'Moisture sensors',
    ],
    configFields: [
      { key: 'cropType', label: 'Crop Type', type: 'text', required: true },
      { key: 'targetMoisture', label: 'Target Moisture', type: 'range', required: false, defaultValue: 15, min: 0, max: 100, unit: '%' },
    ],
  },

  // ============================================================================
  // SPECIALIZED AGRICULTURE (250-299)
  // ============================================================================
  {
    id: NodeType.BEE_HIVE_MONITOR,
    name: 'Bee Hive Monitor',
    category: NodeCategory.SPECIALIZED,
    description: 'Comprehensive bee colony management.',
    icon: 'honeycomb',
    capabilities: [
      'Weight sensors for hive monitoring',
      'Sound sensors for bee activity',
      'Temperature/humidity sensors',
      'Vibration sensors',
      'Air quality sensors',
      'PIR sensors for entrance activity',
    ],
    configFields: [
      { key: 'hiveType', label: 'Hive Type', type: 'select', required: false, options: [
        { value: 'langstroth', label: 'Langstroth' },
        { value: 'top-bar', label: 'Top Bar' },
        { value: 'warre', label: 'Warré' },
      ]},
    ],
  },
  {
    id: NodeType.FISH_POND_MONITOR,
    name: 'Fish Pond Monitor',
    category: NodeCategory.SPECIALIZED,
    description: 'Aquaculture system management.',
    icon: 'fish',
    capabilities: [
      'Dissolved oxygen sensors',
      'pH sensors',
      'Temperature sensors',
      'Turbidity sensors',
      'Water level sensors',
      'Current sensors for aerators',
    ],
    configFields: [
      { key: 'pondVolume', label: 'Pond Volume', type: 'number', required: false, unit: 'gallons' },
      { key: 'fishSpecies', label: 'Fish Species', type: 'text', required: false },
      { key: 'targetDO', label: 'Target Dissolved O2', type: 'number', required: false, unit: 'mg/L', defaultValue: 6 },
    ],
  },
  {
    id: NodeType.HYDROPONIC_CONTROLLER,
    name: 'Hydroponic Controller',
    category: NodeCategory.SPECIALIZED,
    description: 'Soilless growing system automation.',
    icon: 'droplets',
    capabilities: [
      'pH sensors',
      'TDS sensors for nutrients',
      'Water flow sensors',
      'Temperature sensors',
      'Dissolved oxygen sensors',
      'Relay controls for pumps/valves',
    ],
    configFields: [
      { key: 'systemType', label: 'System Type', type: 'select', required: false, options: [
        { value: 'nft', label: 'NFT (Nutrient Film)' },
        { value: 'dwc', label: 'DWC (Deep Water)' },
        { value: 'ebb-flow', label: 'Ebb & Flow' },
        { value: 'drip', label: 'Drip System' },
      ]},
      { key: 'targetPH', label: 'Target pH', type: 'number', required: false, defaultValue: 6.0, min: 4, max: 8 },
      { key: 'targetTDS', label: 'Target TDS', type: 'number', required: false, unit: 'ppm', defaultValue: 1000 },
    ],
  },

  // ============================================================================
  // PROCESSING & HANDLING (300-349)
  // ============================================================================
  {
    id: NodeType.MILK_TANK_MONITOR,
    name: 'Milk Tank Monitor',
    category: NodeCategory.PROCESSING,
    description: 'Dairy operation monitoring with quality assurance.',
    icon: 'milk',
    capabilities: [
      'Temperature sensors for cooling',
      'Ultrasonic sensors for milk level',
      'Vibration sensors for agitator',
      'Current sensors for cooling system',
      'Water flow sensors for cleaning',
      'Load cells for weight',
    ],
    configFields: [
      { key: 'tankCapacity', label: 'Tank Capacity', type: 'number', required: false, unit: 'gallons' },
      { key: 'targetTemp', label: 'Target Temperature', type: 'number', required: false, unit: '°F', defaultValue: 38 },
    ],
  },
  {
    id: NodeType.GRAIN_ELEVATOR_MONITOR,
    name: 'Grain Elevator Monitor',
    category: NodeCategory.PROCESSING,
    description: 'Grain handling safety and inventory management.',
    icon: 'building',
    capabilities: [
      'Dust sensors for explosion hazard',
      'Temperature sensors for fire prevention',
      'Vibration sensors for bearing wear',
      'Current sensors for motors',
      'Ultrasonic sensors for bin level',
      'Emergency stop controls',
    ],
    configFields: [
      { key: 'binCount', label: 'Number of Bins', type: 'number', required: false, defaultValue: 1 },
      { key: 'maxDustLevel', label: 'Max Safe Dust Level', type: 'number', required: false, unit: 'mg/m³', defaultValue: 50 },
    ],
  },
];

/**
 * Get node metadata by type
 */
export function getNodeMetadata(type: NodeType): NodeTypeMetadata | undefined {
  return NODE_CATALOG.find(n => n.id === type);
}

/**
 * Get nodes by category
 */
export function getNodesByCategory(category: NodeCategory): NodeTypeMetadata[] {
  return NODE_CATALOG.filter(n => n.category === category);
}

/**
 * Search nodes by name or description
 */
export function searchNodes(query: string): NodeTypeMetadata[] {
  const lowerQuery = query.toLowerCase();
  return NODE_CATALOG.filter(n =>
    n.name.toLowerCase().includes(lowerQuery) ||
    n.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<NodeCategory, { name: string; icon: string; color: string; description: string }> = {
  [NodeCategory.IRRIGATION]: {
    name: 'Irrigation Systems',
    icon: 'droplet',
    color: '#4A90E2',
    description: 'Water management and distribution control',
  },
  [NodeCategory.LIVESTOCK]: {
    name: 'Livestock Infrastructure',
    icon: 'sheep',
    color: '#8B4513',
    description: 'Animal welfare and facility monitoring',
  },
  [NodeCategory.EQUIPMENT]: {
    name: 'Equipment Monitoring',
    icon: 'cog',
    color: '#F5A623',
    description: 'Farm equipment health and efficiency',
  },
  [NodeCategory.BUILDING]: {
    name: 'Barn & Building',
    icon: 'home',
    color: '#7B6043',
    description: 'Building automation and safety',
  },
  [NodeCategory.CROP]: {
    name: 'Crop & Field',
    icon: 'wheat',
    color: '#50C878',
    description: 'Crop health and field monitoring',
  },
  [NodeCategory.SPECIALIZED]: {
    name: 'Specialized Agriculture',
    icon: 'star',
    color: '#9B59B6',
    description: 'Specialty farming operations',
  },
  [NodeCategory.PROCESSING]: {
    name: 'Processing & Handling',
    icon: 'package',
    color: '#E74C3C',
    description: 'Product processing and storage',
  },
};
