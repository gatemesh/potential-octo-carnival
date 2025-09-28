#include "modules/control/ValveController.h"
#include <cassert>
#include <iostream>

void testValveController() {
    ValveController valve;
    assert(valve.openValve(50));
    // Simulate feedback
    assert(valve.closeValve());
    valve.emergencyStop();
    std::cout << "Valve control test passed\n";
}

int main() {
    testValveController();
    return 0;
}
