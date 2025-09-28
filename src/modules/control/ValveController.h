#pragma once
#include "configuration.h"
#include <driver/gpio.h>

class ValveController {
private:
    static constexpr gpio_num_t VALVE_OPEN_PIN = GPIO_NUM_43;
    static constexpr gpio_num_t VALVE_CLOSE_PIN = GPIO_NUM_44;
    static constexpr gpio_num_t POSITION_SENSOR_PIN = GPIO_NUM_1;
    static constexpr gpio_num_t CURRENT_SENSE_PIN = GPIO_NUM_2;
    enum ValveState {
        CLOSED = 0,
        OPEN = 1,
        MOVING = 2,
        ERROR = 3,
        STUCK = 4
    };
    ValveState currentState = CLOSED;
    uint8_t targetPosition = 0;
    uint8_t currentPosition = 0;
    uint32_t operationStart = 0;
public:
    bool openValve(uint8_t percent = 100) {
        // Example: activate open pin
        gpio_set_level(VALVE_OPEN_PIN, 1);
        // ...simulate movement...
        currentState = MOVING;
        targetPosition = percent;
        // TODO: add position feedback logic
        return true;
    }
    bool closeValve() {
        gpio_set_level(VALVE_CLOSE_PIN, 1);
        currentState = MOVING;
        targetPosition = 0;
        // TODO: add position feedback logic
        return true;
    }
    void emergencyStop() {
        gpio_set_level(VALVE_OPEN_PIN, 0);
        gpio_set_level(VALVE_CLOSE_PIN, 0);
        currentState = ERROR;
    }
    bool checkStuck() {
        // TODO: monitor current draw
        return false;
    }
};
