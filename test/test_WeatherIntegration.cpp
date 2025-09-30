#include "modules/weather/WeatherIntegration.h"
#include <cassert>
#include <iostream>

void testWeatherIntegration()
{
    WeatherIntegration weather;
    weather.updateLocalWeather(75.0, 50.0, 10.0, 0.2); // temp, humidity, wind, rain
    float et = weather.calculateET(75.0, 50.0, 10.0);
    assert(et > 0);
    std::cout << "Weather integration test passed, ET: " << et << "\n";
}

int main()
{
    testWeatherIntegration();
    return 0;
}
