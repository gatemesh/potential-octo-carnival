#include "IrrigationNode.h"
#include "IrrigationTypes.h"
#include <Preferences.h>

IrrigationNodeConfig nodeConfig;

void IrrigationNodeConfig::save() {
    Preferences prefs;
    prefs.begin("irrigation", false);

    prefs.putUChar("type", static_cast<uint8_t>(type));
    prefs.putUInt("zoneId", zoneId);
    prefs.putString("location", locationName);
    prefs.putDouble("latitude", latitude);
    prefs.putDouble("longitude", longitude);
    prefs.putUShort("elevation", elevationM);
    prefs.putUInt("parentNode", parentNode);

    // Save child nodes array
    for (int i = 0; i < 8; i++) {
        char key[16];
        snprintf(key, sizeof(key), "child%d", i);
        prefs.putUInt(key, childNodes[i]);
    }
    prefs.putUChar("childCount", childCount);

    prefs.putUInt("capabilities", capabilities);
    prefs.putFloat("flowCal", flowCalibration);
    prefs.putFloat("pressOff", pressureOffset);
    prefs.putFloat("moistMin", moistureMin);
    prefs.putFloat("moistMax", moistureMax);
    prefs.putUShort("maxFlow", maxFlowGPM);
    prefs.putUShort("minPress", minPressurePSI);
    prefs.putUShort("maxPress", maxPressurePSI);
    prefs.putULong("valveTimeout", valveTimeoutMs);

    prefs.end();
}

void IrrigationNodeConfig::load() {
    Preferences prefs;
    prefs.begin("irrigation", true);

    type = static_cast<Irrigation::NodeType>(prefs.getUChar("type", 0));
    zoneId = prefs.getUInt("zoneId", 0);
    String loc = prefs.getString("location", "");
    strlcpy(locationName, loc.c_str(), sizeof(locationName));
    latitude = prefs.getDouble("latitude", 0.0);
    longitude = prefs.getDouble("longitude", 0.0);
    elevationM = prefs.getUShort("elevation", 0);
    parentNode = prefs.getUInt("parentNode", 0);

    // Load child nodes array
    childCount = 0;
    for (int i = 0; i < 8; i++) {
        char key[16];
        snprintf(key, sizeof(key), "child%d", i);
        childNodes[i] = prefs.getUInt(key, 0);
        if (childNodes[i] != 0) childCount = i + 1;
    }

    capabilities = prefs.getUInt("capabilities", 0);
    flowCalibration = prefs.getFloat("flowCal", 1.0);
    pressureOffset = prefs.getFloat("pressOff", 0.0);
    moistureMin = prefs.getFloat("moistMin", 0.0);
    moistureMax = prefs.getFloat("moistMax", 100.0);
    maxFlowGPM = prefs.getUShort("maxFlow", 0);
    minPressurePSI = prefs.getUShort("minPress", 0);
    maxPressurePSI = prefs.getUShort("maxPress", 0);
    valveTimeoutMs = prefs.getULong("valveTimeout", 30000);

    prefs.end();

    // If no type set, try auto-detection
    if (type == Irrigation::NodeType::UNDEFINED) {
        // TODO: Call auto-detection function
    }

    // Set default capabilities if not set
    if (capabilities == 0) {
        capabilities = static_cast<uint32_t>(getDefaultCapabilities(type));
    }
}

void IrrigationNodeConfig::setDefaults(Irrigation::NodeType nodeType) {
    type = nodeType;
    zoneId = 0;
    locationName[0] = '\0';
    latitude = 0.0;
    longitude = 0.0;
    elevationM = 0;
    parentNode = 0;
    memset(childNodes, 0, sizeof(childNodes));
    childCount = 0;
    capabilities = static_cast<uint32_t>(getDefaultCapabilities(nodeType));

    // Set type-specific defaults
    switch (nodeType) {
        case Irrigation::WATER_LEVEL_SENSOR:
            maxFlowGPM = 0;
            minPressurePSI = 0;
            maxPressurePSI = 50;
            valveTimeoutMs = 0;
            break;

        case Irrigation::SOIL_MOISTURE_SENSOR:
            moistureMin = 0.0;
            moistureMax = 100.0;
            break;

        case Irrigation::GATE_VALVE:
        case Irrigation::VARIABLE_VALVE:
            valveTimeoutMs = 30000; // 30 seconds
            break;

        case Irrigation::HEADGATE_CONTROLLER:
            maxFlowGPM = 1000;
            minPressurePSI = 10;
            maxPressurePSI = 80;
            break;

        default:
            break;
    }
}

bool IrrigationNodeConfig::isController() const {
    return static_cast<uint8_t>(type) >= 1 && static_cast<uint8_t>(type) <= 3;
}

bool IrrigationNodeConfig::isSensor() const {
    return static_cast<uint8_t>(type) >= 10 && static_cast<uint8_t>(type) <= 14;
}

bool IrrigationNodeConfig::isActuator() const {
    return static_cast<uint8_t>(type) >= 20 && static_cast<uint8_t>(type) <= 23;
}

bool IrrigationNodeConfig::hasCapability(Irrigation::Capabilities cap) const {
    return (capabilities & static_cast<uint32_t>(cap)) != 0;
}

void IrrigationNodeConfig::addChild(uint32_t nodeId) {
    if (childCount < 8 && !isChild(nodeId)) {
        childNodes[childCount++] = nodeId;
    }
}

void IrrigationNodeConfig::removeChild(uint32_t nodeId) {
    for (int i = 0; i < childCount; i++) {
        if (childNodes[i] == nodeId) {
            // Shift remaining elements
            for (int j = i; j < childCount - 1; j++) {
                childNodes[j] = childNodes[j + 1];
            }
            childNodes[--childCount] = 0;
            break;
        }
    }
}

bool IrrigationNodeConfig::isChild(uint32_t nodeId) const {
    for (int i = 0; i < childCount; i++) {
        if (childNodes[i] == nodeId) {
            return true;
        }
    }
    return false;
}