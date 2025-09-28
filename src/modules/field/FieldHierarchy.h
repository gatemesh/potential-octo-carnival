#pragma once
#include <map>
#include <vector>
#include <string>

namespace GateMesh {

class FieldHierarchy {
public:
    struct Field;
    struct Zone;
    struct Farm {
        std::string id;
        std::string name;
        float total_acres;
        float irrigated_acres;
        std::vector<Field*> fields;
        std::vector<Infrastructure*> infrastructure;
        // WaterRights water_rights; // Placeholder
    };
    struct Field {
        std::string id;
        std::string display_name;
        float acres;
        std::string crop_type;
        std::vector<Zone*> zones;
        Farm* parent_farm;
        float getTotalWaterUsed() const { return 0; }
        float getAverageMoisture() const { return 0; }
        bool needsIrrigation() const { return false; }
    };
    struct Zone {
        std::string id;
        std::string display_name;
        float acres;
        uint8_t priority;
        Field* parent_field;
        std::vector<void*> valves; // Placeholder
        std::vector<void*> sensors; // Placeholder
        // Schedule schedule; // Placeholder
        bool isIrrigating() const { return false; }
        void startIrrigation() {}
        void stopIrrigation() {}
        float getMoistureLevel() const { return 0; }
    };
    struct Infrastructure {
        enum Type { HEADGATE, PUMP_STATION, RESERVOIR, REPEATER, WEATHER_STATION };
        Type type;
        std::string id;
        std::string location;
        std::vector<uint32_t> node_ids;
    };
private:
    Farm farm;
    std::map<std::string, Field*> fields_by_id;
    std::map<std::string, Zone*> zones_by_id;
    std::map<uint32_t, std::string> node_to_zone;
public:
    Field* getField(const std::string& id) { return fields_by_id[id]; }
    Zone* getZone(const std::string& id) { return zones_by_id[id]; }
    Zone* getZoneByNode(uint32_t node_id) { return zones_by_id[node_to_zone[node_id]]; }
    std::vector<Zone*> getZonesByField(const std::string& field_id) { return fields_by_id[field_id]->zones; }
    void addField(Field* field) { fields_by_id[field->id] = field; farm.fields.push_back(field); }
    void addZone(const std::string& field_id, Zone* zone) { zones_by_id[zone->id] = zone; fields_by_id[field_id]->zones.push_back(zone); }
    void assignNodeToZone(uint32_t node_id, const std::string& zone_id) { node_to_zone[node_id] = zone_id; }
};

} // namespace GateMesh
