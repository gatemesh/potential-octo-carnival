#pragma once

#include "SinglePortModule.h"
#include "IrrigationNode.h"
#include "IrrigationTypes.h"
#include "concurrency/OSThread.h"

class IrrigationModule : public SinglePortModule, private concurrency::OSThread {
public:
    IrrigationModule();

    // Module interface
    bool wantPacket(const meshtastic_MeshPacket *p) override;
    ProcessMessage handleReceived(const meshtastic_MeshPacket &mp) override;
    int32_t runOnce() override;

    // Console command handler
    void handleConsoleCommand(const char* cmd);

    // Setup and initialization
    void setup();
    void loadConfig();
    void saveConfig();

    // Node type and state management
    void setNodeType(Irrigation::NodeType type);
    void setState(Irrigation::IrrigationState newState);

    // Command processing
    bool canAcceptCommand(uint32_t sourceNode, const meshtastic_MeshPacket &packet);
    void processCommand(const meshtastic_MeshPacket &packet);

private:
    Irrigation::IrrigationState currentState = Irrigation::OFFLINE;

    // Timing
    uint32_t lastSensorUpdate = 0;
    uint32_t lastStatusReport = 0;
    uint32_t sensorIntervalMs = 60000; // 1 minute default

    // Hardware detection results
    bool hasFlowSensor = false;
    bool hasPressureSensor = false;
    bool hasMoistureSensor = false;
    bool hasMotorControl = false;
    bool hasLevelSensor = false;
    bool hasWeatherSensors = false;

    // Sensor values
    float currentFlowRate = 0.0;
    float currentPressure = 0.0;
    float currentMoisture = 0.0;
    float currentWaterLevel = 0.0;

    // Actuator states
    bool valveOpen = false;
    uint8_t valvePosition = 0; // 0-100%
    bool pumpRunning = false;

    // Helper methods
    void sendStatusReport();
    void sendSensorData();
    void handleValveCommand(uint8_t position, uint32_t duration);
    void handlePumpCommand(bool enable);
    void updateDisplay();
    void setupRoleBehavior();

    // Core functionality
    void updateSensors();
    void controlActuators();
    void performAutoDetection();

    // Hardware interface methods (to be implemented based on actual hardware)
    bool detectFlowSensor();
    bool detectPressureSensor();
    bool detectMoistureSensor();
    bool detectMotorControl();
    bool detectLevelSensor();
    bool detectWeatherSensors();

    float readFlowRate();
    float readPressure();
    float readMoisture();
    float readWaterLevel();
    void setValvePosition(uint8_t position);
    void setPumpState(bool enable);
};

extern IrrigationModule *irrigationModule;