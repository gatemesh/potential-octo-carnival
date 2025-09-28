#include "modules/scheduling/IrrigationScheduler.h"
#include <cassert>
#include <iostream>

void testIrrigationScheduler() {
    IrrigationScheduler scheduler;
    scheduler.addSchedule(1, 6, 0, 60, true); // Zone 1, 6:00 AM, 60 min
    scheduler.checkSchedule(6, 0);
    assert(scheduler.isIrrigating());
    scheduler.stopIrrigation();
    assert(!scheduler.isIrrigating());
    std::cout << "Scheduler test passed\n";
}

int main() {
    testIrrigationScheduler();
    return 0;
}
