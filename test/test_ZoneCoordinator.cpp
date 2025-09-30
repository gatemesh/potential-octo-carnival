#include "modules/coordination/ZoneCoordinator.h"
#include <cassert>
#include <iostream>

void testZoneCoordinator()
{
    ZoneCoordinator coordinator;
    coordinator.addZone(1);
    coordinator.addZone(2);
    assert(coordinator.requestIrrigation(1));
    assert(coordinator.requestIrrigation(2));
    coordinator.stopIrrigation(1);
    coordinator.stopIrrigation(2);
    std::cout << "Zone coordination test passed\n";
}

int main()
{
    testZoneCoordinator();
    return 0;
}
