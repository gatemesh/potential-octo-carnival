#pragma once
#include <Wire.h>
#include "configuration.h"

class WaterLevelSensor {
private:
    static constexpr uint8_t SENSOR_ADDR = 0x77;  // Example I2C address
    static constexpr uint8_t CMD_READ_LEVEL = 0x01;
    float lastLevel = 0.0;
    float alertLevel = 0.0;
    float criticalLevel = 0.0;
    uint32_t lastReadTime = 0;
public:
    bool init() {
        Wire.begin(I2C_SDA, I2C_SCL);
        // Optionally check sensor presence
        Wire.beginTransmission(SENSOR_ADDR);
        if (Wire.endTransmission() != 0) return false;
        return true;
    }
    float readLevel() {
        Wire.beginTransmission(SENSOR_ADDR);
        Wire.write(CMD_READ_LEVEL);
        Wire.endTransmission();
        Wire.requestFrom(SENSOR_ADDR, (uint8_t)2);
        if (Wire.available() < 2) return -1;
        uint16_t raw = Wire.read() << 8 | Wire.read();
        lastLevel = raw * 0.01; // Example conversion
        lastReadTime = millis();
        return lastLevel;
    }
    bool checkAlerts() {
        if (lastLevel >= criticalLevel) {
            // Trigger alert
            return true;
        }
        return false;
    }
};
