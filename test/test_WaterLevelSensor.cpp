#include "modules/sensors/WaterLevelSensor.h"
#include <cassert>
#include <iostream>

void testWaterLevelSensor() {
    WaterLevelSensor sensor;
    assert(sensor.init());
    float level = sensor.readLevel();
    assert(level >= 0 && level <= 100);
    std::cout << "Water level test passed: " << level << " ft\n";
}

int main() {
    testWaterLevelSensor();
    return 0;
}
