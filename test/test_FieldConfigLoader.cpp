#include "modules/field/FieldConfigLoader.cpp"
#include <cassert>
#include <iostream>

void testFieldConfigLoader()
{
    FieldConfigLoader loader;
    // Simulate loading from a file (mock or SD required for real test)
    bool loaded = loader.loadFarmConfiguration("/sd/farm_config.json");
    // For now, just check that the method runs (will fail without SD)
    std::cout << "FieldConfigLoader loadFarmConfiguration returned: " << loaded << "\n";
}

int main()
{
    testFieldConfigLoader();
    return 0;
}
