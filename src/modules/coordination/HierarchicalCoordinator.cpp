#include "../field/FieldHierarchy.h"

using namespace GateMesh;

class HierarchicalCoordinator {
private:
    FieldHierarchy hierarchy;
public:
    void coordinateIrrigation() {
        auto zones = hierarchy.getZonesByField("north_40"); // Example
        for (auto* zone : zones) {
            FieldHierarchy::Field* field = zone->parent_field;
            if (field->getTotalWaterUsed() >= 100000) continue; // Example allocation
            if (zone->getMoistureLevel() < 60) {
                requestZoneIrrigation(zone);
            }
        }
    }
    bool requestZoneIrrigation(FieldHierarchy::Zone* zone) {
        FieldHierarchy::Field* field = zone->parent_field;
        auto sibling_zones = hierarchy.getZonesByField(field->id);
        int active_count = 0;
        for (auto* sibling : sibling_zones) {
            if (sibling->isIrrigating()) active_count++;
        }
        if (active_count >= 2) return false; // Example max concurrent
        zone->startIrrigation();
        return true;
    }
};
