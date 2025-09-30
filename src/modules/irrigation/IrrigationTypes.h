#pragma once

#include <cstdint>

namespace Irrigation
{

// Primary irrigation node types
enum NodeType {
    UNDEFINED = 0,

    // Controllers (can command other nodes)
    HEADGATE_CONTROLLER = 1, // Main gate control
    SECTION_CONTROLLER = 2,  // Zone/section control
    PUMP_CONTROLLER = 3,     // Pump station control

    // Sensors (report data only)
    WATER_LEVEL_SENSOR = 10,   // Canal/reservoir level
    FLOW_SENSOR = 11,          // Flow rate monitoring
    SOIL_MOISTURE_SENSOR = 12, // Field moisture
    PRESSURE_SENSOR = 13,      // Line pressure
    WEATHER_STATION = 14,      // Weather data

    // Actuators (receive commands)
    GATE_VALVE = 20,     // Simple open/close valve
    VARIABLE_VALVE = 21, // Variable position valve
    PUMP_RELAY = 22,     // Pump on/off control
    LATERAL_VALVE = 23,  // Lateral line valve

    // Hybrid (sensor + actuator)
    SMART_VALVE = 30,      // Valve with flow sensor
    SMART_PUMP = 31,       // Pump with pressure sensor
    PIVOT_CONTROLLER = 32, // Center pivot irrigation

    // Infrastructure
    REPEATER_STATION = 40, // Signal repeater only
    GATEWAY_STATION = 41,  // Internet/SCADA gateway
    WEATHER_GATEWAY = 42,  // Weather data gateway

    // Monitoring
    OBSERVER = 50 // Read-only monitoring node
};

// Node capabilities flags
enum Capabilities {
    NONE = 0,
    CAN_CONTROL = (1 << 0),        // Can send commands
    CAN_SENSE = (1 << 1),          // Has sensors
    CAN_ACTUATE = (1 << 2),        // Has actuators
    HAS_FLOW_METER = (1 << 3),     // Flow measurement
    HAS_PRESSURE = (1 << 4),       // Pressure sensor
    HAS_MOISTURE = (1 << 5),       // Moisture sensor
    HAS_LEVEL = (1 << 6),          // Level sensor
    HAS_WEATHER = (1 << 7),        // Weather sensors
    GPS_CAPABLE = (1 << 8),        // Position aware
    HAS_SCHEDULE = (1 << 9),       // Autonomous scheduling
    BATTERY_POWERED = (1 << 10),   // Battery vs mains
    SOLAR_POWERED = (1 << 11),     // Solar charging
    HAS_BACKUP = (1 << 12),        // Backup power
    REMOTE_MANAGEABLE = (1 << 13), // OTA updates
    DATA_LOGGER = (1 << 14),       // SD card logging
    ALARM_CAPABLE = (1 << 15)      // Can trigger alarms
};

// Operating states
enum IrrigationState {
    OFFLINE = 0,
    INITIALIZING = 1,
    IDLE = 2,
    ACTIVE = 3,
    IRRIGATING = 4,
    DRAINING = 5,
    ERROR = 6,
    MAINTENANCE = 7,
    EMERGENCY_STOP = 8
};

// Helper functions
const char *getNodeTypeName(NodeType type);
const char *getStateName(IrrigationState state);
const char *getNodeTypeIcon(NodeType type);
Capabilities getDefaultCapabilities(NodeType type);

} // namespace Irrigation