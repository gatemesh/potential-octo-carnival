#include "modules/field/FieldHierarchy.h"
#include <cassert>
#include <iostream>

using namespace GateMesh;

void testFieldHierarchy()
{
    FieldHierarchy hierarchy;
    auto *field = new FieldHierarchy::Field();
    field->id = "north_40";
    field->display_name = "North 40 Acres";
    field->acres = 40.0;
    field->crop_type = "alfalfa";
    hierarchy.addField(field);
    auto *zone = new FieldHierarchy::Zone();
    zone->id = "zone_01";
    zone->display_name = "Zone 1";
    zone->acres = 13.5;
    zone->priority = 1;
    zone->parent_field = field;
    hierarchy.addZone(field->id, zone);
    hierarchy.assignNodeToZone(0x1001, zone->id);
    assert(hierarchy.getField("north_40") == field);
    assert(hierarchy.getZone("zone_01") == zone);
    assert(hierarchy.getZoneByNode(0x1001) == zone);
    std::cout << "FieldHierarchy test passed\n";
}

int main()
{
    testFieldHierarchy();
    return 0;
}
