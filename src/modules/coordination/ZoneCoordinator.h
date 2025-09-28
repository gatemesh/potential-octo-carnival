#pragma once
#include <vector>
#include "configuration.h"

class ZoneCoordinator {
private:
    struct Zone {
        uint8_t id;
        bool active;
        float totalWaterUsed;
    };
    std::vector<Zone> zones;
    uint8_t maxConcurrentZones = 2;
    uint8_t activeZoneCount = 0;
public:
    void addZone(uint8_t id) {
        zones.push_back({id, false, 0.0f});
    }
    bool requestIrrigation(uint8_t zoneId) {
        for (auto& zone : zones) {
            if (zone.id == zoneId && activeZoneCount < maxConcurrentZones) {
                zone.active = true;
                activeZoneCount++;
                return true;
            }
        }
        return false;
    }
    void stopIrrigation(uint8_t zoneId) {
        for (auto& zone : zones) {
            if (zone.id == zoneId && zone.active) {
                zone.active = false;
                activeZoneCount--;
            }
        }
    }
    void monitorZones() {
        // TODO: monitor water usage, detect leaks
    }
};
