#pragma once
#include "IrrigationTypes.h"
#include "configuration.h"

class IrrigationNodeConfig {
public:
    // Identity
    Irrigation::NodeType type = Irrigation::UNDEFINED;
    uint32_t zoneId = 0;           // Which irrigation zone
    char locationName[32] = {0};    // Human-readable location

    // Position (for mapping)
    double latitude = 0.0;
    double longitude = 0.0;
    uint16_t elevationM = 0;        // Elevation in meters

    // Relationships
    uint32_t parentNode = 0;        // Upstream controller
    uint32_t childNodes[8] = {0};   // Downstream devices
    uint8_t childCount = 0;

    // Capabilities
    uint32_t capabilities = 0;

    // Calibration
    float flowCalibration = 1.0;    // Flow meter K-factor
    float pressureOffset = 0.0;     // Pressure calibration
    float moistureMin = 0.0;        // Dry reading
    float moistureMax = 100.0;      // Wet reading

    // Operating parameters
    uint16_t maxFlowGPM = 0;        // Max flow rate
    uint16_t minPressurePSI = 0;    // Min operating pressure
    uint16_t maxPressurePSI = 0;    // Max safe pressure
    uint32_t valveTimeoutMs = 30000; // Valve operation timeout

    // Save/Load from NVS
    void save();
    void load();
    void setDefaults(Irrigation::NodeType type);

    // Utility functions
    bool isController() const;
    bool isSensor() const;
    bool isActuator() const;
    bool hasCapability(Irrigation::Capabilities cap) const;
    void addChild(uint32_t nodeId);
    void removeChild(uint32_t nodeId);
    bool isChild(uint32_t nodeId) const;
};

extern IrrigationNodeConfig nodeConfig;