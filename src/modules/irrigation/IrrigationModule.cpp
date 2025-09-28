#include "IrrigationModule.h"
#include "IrrigationTypes.h"
#include "NodeDB.h"
#include "PowerFSM.h"
#include "main.h"
// #include "mesh/generated/meshtastic/irrigation.pb.h"  // Temporarily disabled until protobuf generation works
#include <Arduino.h>

// Temporary definition until protobuf is generated
#ifndef meshtastic_PortNum_IRRIGATION_APP
#define meshtastic_PortNum_IRRIGATION_APP 68
#endif

IrrigationModule *irrigationModule;

IrrigationModule::IrrigationModule() : SinglePortModule("Irrigation", (meshtastic_PortNum)68), concurrency::OSThread("Irrigation") {
}

bool IrrigationModule::wantPacket(const meshtastic_MeshPacket *p) {
    // Accept packets for our port number
    return p->decoded.portnum == meshtastic_PortNum_IRRIGATION_APP;
}

void IrrigationModule::setup() {
    // Load configuration
    loadConfig();

    // Perform hardware auto-detection if type is undefined
    if (nodeConfig.type == Irrigation::UNDEFINED) {
        performAutoDetection();
    }

    // Set initial state
    setState(Irrigation::IDLE);

    // Configure behavior based on type
    setupRoleBehavior();

    LOG_INFO("Irrigation module initialized as %s", Irrigation::getNodeTypeName(nodeConfig.type));
}

void IrrigationModule::setupRoleBehavior() {
    switch (nodeConfig.type) {
        case Irrigation::WATER_LEVEL_SENSOR:
            // Report water level every 5 minutes
            sensorIntervalMs = 300000;
            break;

        case Irrigation::SOIL_MOISTURE_SENSOR:
            // Report moisture every 15 minutes
            sensorIntervalMs = 900000;
            break;

        case Irrigation::HEADGATE_CONTROLLER:
            // Always awake, check for commands frequently
            sensorIntervalMs = 10000;
            break;

        case Irrigation::GATE_VALVE:
            // Listen for commands, report status periodically
            sensorIntervalMs = 30000;
            break;

        case Irrigation::WEATHER_STATION:
            // Report weather every 10 minutes
            sensorIntervalMs = 600000;
            break;

        default:
            sensorIntervalMs = 60000; // 1 minute default
            break;
    }
}

int32_t IrrigationModule::runOnce() {
    // Update state if initializing
    if (currentState == Irrigation::INITIALIZING) {
        setState(Irrigation::IDLE);
    }

    uint32_t now = millis();

    // Update sensors periodically
    if (now - lastSensorUpdate >= sensorIntervalMs) {
        updateSensors();
        lastSensorUpdate = now;
    }

    // Send status reports periodically (every 5 minutes)
    if (now - lastStatusReport >= 300000) {
        sendStatusReport();
        lastStatusReport = now;
    }

    // Update display if needed
    updateDisplay();

    return sensorIntervalMs; // Return next run time
}

ProcessMessage IrrigationModule::handleReceived(const meshtastic_MeshPacket &mp) {
    // Only handle irrigation messages
    if (mp.decoded.portnum != meshtastic_PortNum_IRRIGATION_APP) {
        return ProcessMessage::CONTINUE;
    }

    // Check if we can accept commands from this node
    if (!canAcceptCommand(mp.from, mp)) {
        LOG_WARN("Rejected command from node 0x%x (no authority)", mp.from);
        return ProcessMessage::STOP;
    }

    // For now, just log the message - protobuf decoding disabled
    LOG_INFO("Received irrigation message from 0x%x, size: %d", mp.from, mp.decoded.payload.size);

    // TODO: Process irrigation commands when protobuf is available
    // processCommand(mp);
    return ProcessMessage::STOP;
}

void IrrigationModule::setNodeType(Irrigation::NodeType type) {
    nodeConfig.setDefaults(type);
    saveConfig();
    setupRoleBehavior();
    LOG_INFO("Node type set to %s", Irrigation::getNodeTypeName(type));
}

void IrrigationModule::setState(Irrigation::IrrigationState newState) {
    if (currentState != newState) {
        LOG_INFO("Irrigation state changed: %s -> %s",
                 Irrigation::getStateName(currentState),
                 Irrigation::getStateName(newState));
        currentState = newState;
    }
}

bool IrrigationModule::canAcceptCommand(uint32_t sourceNode, const meshtastic_MeshPacket &packet) {
    // Controllers can command their children
    if (nodeConfig.isController()) {
        return nodeConfig.isChild(sourceNode);
    }

    // Headgate controller can command anything
    if (nodeConfig.type == Irrigation::HEADGATE_CONTROLLER) {
        return true;
    }

    // Parent can command children
    if (nodeConfig.parentNode == sourceNode) {
        return true;
    }

    return false;
}

void IrrigationModule::processCommand(const meshtastic_MeshPacket &packet) {
    // TODO: Decode and process irrigation commands
    // This will depend on the protobuf definitions
    LOG_INFO("Processing irrigation command from 0x%x", packet.from);
}

void IrrigationModule::updateSensors() {
    if (!nodeConfig.isSensor() && !nodeConfig.hasCapability(Irrigation::CAN_SENSE)) {
        return;
    }

    // Read sensors based on type
    if (hasFlowSensor) {
        currentFlowRate = readFlowRate();
    }

    if (hasPressureSensor) {
        currentPressure = readPressure();
    }

    if (hasMoistureSensor) {
        currentMoisture = readMoisture();
    }

    if (hasLevelSensor) {
        currentWaterLevel = readWaterLevel();
    }

    // Send sensor data
    sendSensorData();
}

void IrrigationModule::controlActuators() {
    if (!nodeConfig.isActuator() && !nodeConfig.hasCapability(Irrigation::CAN_ACTUATE)) {
        return;
    }

    // Control actuators based on commands received
    // TODO: Implement actuator control logic
}

void IrrigationModule::performAutoDetection() {
    LOG_INFO("Performing hardware auto-detection...");

    hasFlowSensor = detectFlowSensor();
    hasPressureSensor = detectPressureSensor();
    hasMoistureSensor = detectMoistureSensor();
    hasMotorControl = detectMotorControl();
    hasLevelSensor = detectLevelSensor();
    hasWeatherSensors = detectWeatherSensors();

    // Determine node type based on detected hardware
    Irrigation::NodeType detectedType = Irrigation::UNDEFINED;

    if (hasFlowSensor && hasMotorControl) {
        detectedType = Irrigation::SMART_VALVE;
    } else if (hasFlowSensor) {
        detectedType = Irrigation::FLOW_SENSOR;
    } else if (hasLevelSensor) {
        detectedType = Irrigation::WATER_LEVEL_SENSOR;
    } else if (hasMoistureSensor) {
        detectedType = Irrigation::SOIL_MOISTURE_SENSOR;
    } else if (hasMotorControl) {
        detectedType = Irrigation::GATE_VALVE;
    } else if (hasWeatherSensors) {
        detectedType = Irrigation::WEATHER_STATION;
    }

    if (detectedType != Irrigation::UNDEFINED) {
        LOG_INFO("Auto-detected node type: %s", Irrigation::getNodeTypeName(detectedType));
        setNodeType(detectedType);
    } else {
        LOG_INFO("Could not auto-detect node type, remaining undefined");
    }
}

void IrrigationModule::handleConsoleCommand(const char* cmd) {
    if (strncmp(cmd, "role ", 5) == 0) {
        const char* roleStr = cmd + 5;

        if (strcmp(roleStr, "headgate") == 0) {
            setNodeType(Irrigation::HEADGATE_CONTROLLER);
            LOG_INFO("Set role to HEADGATE CONTROLLER\n");
        }
        else if (strcmp(roleStr, "water-sensor") == 0) {
            setNodeType(Irrigation::WATER_LEVEL_SENSOR);
            LOG_INFO("Set role to WATER LEVEL SENSOR\n");
        }
        else if (strcmp(roleStr, "valve") == 0) {
            setNodeType(Irrigation::GATE_VALVE);
            LOG_INFO("Set role to GATE VALVE\n");
        }
        else if (strcmp(roleStr, "pump") == 0) {
            setNodeType(Irrigation::PUMP_CONTROLLER);
            LOG_INFO("Set role to PUMP CONTROLLER\n");
        }
        else if (strcmp(roleStr, "moisture") == 0) {
            setNodeType(Irrigation::SOIL_MOISTURE_SENSOR);
            LOG_INFO("Set role to SOIL MOISTURE SENSOR\n");
        }
        else if (strcmp(roleStr, "weather") == 0) {
            setNodeType(Irrigation::WEATHER_STATION);
            LOG_INFO("Set role to WEATHER STATION\n");
        }
        else {
            LOG_ERROR("Unknown role: %s\n", roleStr);
            LOG_INFO("Available roles:\n");
            LOG_INFO("  headgate    - Main gate controller\n");
            LOG_INFO("  water-sensor - Water level sensor\n");
            LOG_INFO("  valve       - Gate valve actuator\n");
            LOG_INFO("  pump        - Pump controller\n");
            LOG_INFO("  moisture    - Soil moisture sensor\n");
            LOG_INFO("  weather     - Weather station\n");
        }
    }
    else if (strcmp(cmd, "status") == 0) {
        LOG_INFO("Irrigation Status:\n");
        LOG_INFO("  Type: %s\n", Irrigation::getNodeTypeName(nodeConfig.type));
        LOG_INFO("  Zone: %d\n", nodeConfig.zoneId);
        LOG_INFO("  Location: %s\n", nodeConfig.locationName);
        LOG_INFO("  State: %s\n", Irrigation::getStateName(currentState));
        LOG_INFO("  Parent: 0x%x\n", nodeConfig.parentNode);
        LOG_INFO("  Children: %d nodes\n", nodeConfig.childCount);
    }
}

void IrrigationModule::sendStatusReport() {
    // TODO: Send periodic status report
    LOG_DEBUG("Sending irrigation status report");
}

void IrrigationModule::sendSensorData() {
    // TODO: Send sensor data
    LOG_DEBUG("Sending sensor data");
}

void IrrigationModule::handleValveCommand(uint8_t position, uint32_t duration) {
    setValvePosition(position);
    valvePosition = position;
    LOG_INFO("Valve set to %d%%", position);
}

void IrrigationModule::handlePumpCommand(bool enable) {
    setPumpState(enable);
    pumpRunning = enable;
    LOG_INFO("Pump %s", enable ? "started" : "stopped");
}

void IrrigationModule::updateDisplay() {
    // TODO: Update OLED display with irrigation info
}

// Hardware detection stubs (to be implemented based on actual hardware)
bool IrrigationModule::detectFlowSensor() { return false; }
bool IrrigationModule::detectPressureSensor() { return false; }
bool IrrigationModule::detectMoistureSensor() { return false; }
bool IrrigationModule::detectMotorControl() { return false; }
bool IrrigationModule::detectLevelSensor() { return false; }
bool IrrigationModule::detectWeatherSensors() { return false; }

float IrrigationModule::readFlowRate() { return 0.0; }
float IrrigationModule::readPressure() { return 0.0; }
float IrrigationModule::readMoisture() { return 0.0; }
float IrrigationModule::readWaterLevel() { return 0.0; }
void IrrigationModule::setValvePosition(uint8_t position) {}
void IrrigationModule::setPumpState(bool enable) {}

void IrrigationModule::loadConfig() {
    nodeConfig.load();
}

void IrrigationModule::saveConfig() {
    nodeConfig.save();
}