#pragma once
#include <vector>
#include "configuration.h"

class IrrigationScheduler {
private:
    struct ScheduleEntry {
        uint8_t zone;
        uint8_t startHour;
        uint8_t startMinute;
        uint16_t durationMinutes;
        bool enabled;
    };
    std::vector<ScheduleEntry> schedule;
    ScheduleEntry* activeEntry = nullptr;
    uint32_t irrigationStartTime = 0;
public:
    void addSchedule(uint8_t zone, uint8_t hour, uint8_t minute, uint16_t duration, bool enabled) {
        schedule.push_back({zone, hour, minute, duration, enabled});
    }
    void checkSchedule(uint8_t currentHour, uint8_t currentMinute) {
        for (auto& entry : schedule) {
            if (entry.enabled && entry.startHour == currentHour && entry.startMinute == currentMinute) {
                startIrrigation(entry);
            }
        }
    }
    void startIrrigation(ScheduleEntry& entry) {
        activeEntry = &entry;
        irrigationStartTime = millis();
        // TODO: trigger valve control
    }
    void stopIrrigation() {
        activeEntry = nullptr;
    }
    bool isIrrigating() const {
        return activeEntry != nullptr;
    }
};
