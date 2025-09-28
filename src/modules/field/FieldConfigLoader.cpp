#include "FieldHierarchy.h"
#include <ArduinoJson.h>
#include <SD.h>

using namespace GateMesh;

class FieldConfigLoader {
public:
    FieldHierarchy hierarchy;
    bool loadFarmConfiguration(const char* path) {
        File configFile = SD.open(path);
        if (!configFile) return false;
        StaticJsonDocument<4096> doc;
        DeserializationError error = deserializeJson(doc, configFile);
        configFile.close();
        if (error) return false;
        JsonObject farm = doc["farm"];
        // Parse farm fields
        JsonArray fields = farm["fields"];
        for (JsonObject field : fields) {
            loadField(field);
        }
        // Parse infrastructure
        JsonArray infrastructure = farm["infrastructure"];
        for (JsonObject infra : infrastructure) {
            // TODO: load infrastructure
        }
        return true;
    }
private:
    void loadField(JsonObject& fieldJson) {
        auto* field = new FieldHierarchy::Field();
        field->id = fieldJson["id"].as<String>().c_str();
        field->display_name = fieldJson["display_name"].as<String>().c_str();
        field->acres = fieldJson["acres"];
        field->crop_type = fieldJson["crop"]["type"].as<String>().c_str();
        // Load zones
        JsonArray zones = fieldJson["zones"];
        for (JsonObject zone : zones) {
            loadZone(field->id, zone, field);
        }
        hierarchy.addField(field);
    }
    void loadZone(const std::string& field_id, JsonObject& zoneJson, FieldHierarchy::Field* parent_field) {
        auto* zone = new FieldHierarchy::Zone();
        zone->id = zoneJson["id"].as<String>().c_str();
        zone->display_name = zoneJson["display_name"].as<String>().c_str();
        zone->acres = zoneJson["acres"];
        zone->priority = zoneJson["priority"];
        zone->parent_field = parent_field;
        // TODO: load valves, sensors, schedule
        hierarchy.addZone(field_id, zone);
    }
};
