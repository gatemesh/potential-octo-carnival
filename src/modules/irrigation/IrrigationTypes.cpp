#include "IrrigationTypes.h"

namespace Irrigation {

const char* getNodeTypeName(NodeType type) {
    switch (type) {
        case UNDEFINED: return "Undefined";
        case HEADGATE_CONTROLLER: return "Headgate Controller";
        case SECTION_CONTROLLER: return "Section Controller";
        case PUMP_CONTROLLER: return "Pump Controller";
        case WATER_LEVEL_SENSOR: return "Water Level Sensor";
        case FLOW_SENSOR: return "Flow Sensor";
        case SOIL_MOISTURE_SENSOR: return "Soil Moisture Sensor";
        case PRESSURE_SENSOR: return "Pressure Sensor";
        case WEATHER_STATION: return "Weather Station";
        case GATE_VALVE: return "Gate Valve";
        case VARIABLE_VALVE: return "Variable Valve";
        case PUMP_RELAY: return "Pump Relay";
        case LATERAL_VALVE: return "Lateral Valve";
        case SMART_VALVE: return "Smart Valve";
        case SMART_PUMP: return "Smart Pump";
        case PIVOT_CONTROLLER: return "Pivot Controller";
        case REPEATER_STATION: return "Repeater Station";
        case GATEWAY_STATION: return "Gateway Station";
        case WEATHER_GATEWAY: return "Weather Gateway";
        case OBSERVER: return "Observer";
        default: return "Unknown";
    }
}

const char* getStateName(IrrigationState state) {
    switch (state) {
        case OFFLINE: return "Offline";
        case INITIALIZING: return "Initializing";
        case IDLE: return "Idle";
        case ACTIVE: return "Active";
        case IRRIGATING: return "Irrigating";
        case DRAINING: return "Draining";
        case ERROR: return "Error";
        case MAINTENANCE: return "Maintenance";
        case EMERGENCY_STOP: return "Emergency Stop";
        default: return "Unknown";
    }
}

const char* getNodeTypeIcon(NodeType type) {
    switch (type) {
        case HEADGATE_CONTROLLER: return "🚪";
        case WATER_LEVEL_SENSOR: return "💧";
        case SOIL_MOISTURE_SENSOR: return "🌱";
        case GATE_VALVE: return "🔧";
        case PUMP_CONTROLLER: return "⛽";
        case WEATHER_STATION: return "🌤️";
        case FLOW_SENSOR: return "🌊";
        case PRESSURE_SENSOR: return "📊";
        case VARIABLE_VALVE: return "⚙️";
        case PUMP_RELAY: return "🔌";
        case LATERAL_VALVE: return "🚿";
        case SMART_VALVE: return "🤖";
        case SMART_PUMP: return "⚡";
        case PIVOT_CONTROLLER: return "🔄";
        case REPEATER_STATION: return "📡";
        case GATEWAY_STATION: return "🌐";
        case WEATHER_GATEWAY: return "☁️";
        case OBSERVER: return "👁️";
        default: return "❓";
    }
}

Capabilities getDefaultCapabilities(NodeType type) {
    switch (type) {
        case HEADGATE_CONTROLLER:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_CONTROL) |
                static_cast<uint32_t>(HAS_SCHEDULE) |
                static_cast<uint32_t>(REMOTE_MANAGEABLE)
            );

        case SECTION_CONTROLLER:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_CONTROL) |
                static_cast<uint32_t>(HAS_SCHEDULE)
            );

        case PUMP_CONTROLLER:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_CONTROL) |
                static_cast<uint32_t>(CAN_ACTUATE)
            );

        case WATER_LEVEL_SENSOR:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(HAS_LEVEL) |
                static_cast<uint32_t>(BATTERY_POWERED)
            );

        case FLOW_SENSOR:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(HAS_FLOW_METER)
            );

        case SOIL_MOISTURE_SENSOR:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(HAS_MOISTURE) |
                static_cast<uint32_t>(BATTERY_POWERED)
            );

        case PRESSURE_SENSOR:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(HAS_PRESSURE)
            );

        case WEATHER_STATION:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(HAS_WEATHER) |
                static_cast<uint32_t>(BATTERY_POWERED) |
                static_cast<uint32_t>(SOLAR_POWERED)
            );

        case GATE_VALVE:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_ACTUATE)
            );

        case VARIABLE_VALVE:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_ACTUATE)
            );

        case PUMP_RELAY:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_ACTUATE)
            );

        case SMART_VALVE:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(CAN_ACTUATE) |
                static_cast<uint32_t>(HAS_FLOW_METER)
            );

        case SMART_PUMP:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(CAN_SENSE) |
                static_cast<uint32_t>(CAN_ACTUATE) |
                static_cast<uint32_t>(HAS_PRESSURE)
            );

        case REPEATER_STATION:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(REMOTE_MANAGEABLE)
            );

        case GATEWAY_STATION:
            return static_cast<Capabilities>(
                static_cast<uint32_t>(REMOTE_MANAGEABLE) |
                static_cast<uint32_t>(DATA_LOGGER)
            );

        default:
            return NONE;
    }
}

} // namespace Irrigation