#pragma once
#include "configuration.h"
#include <Wire.h>

class WeatherIntegration {
private:
    float dailyET = 0;
    float precipitationInches = 0;
    float temperature = 0;
    float humidity = 0;
    float windSpeed = 0;
public:
    void updateLocalWeather(float temp, float humidity, float wind, float rain) {
        temperature = temp;
        this->humidity = humidity;
        windSpeed = wind;
        precipitationInches = rain;
        adjustIrrigationSchedule();
    }
    float calculateET(float temp, float humidity, float wind) {
        // Simplified ET calculation
        return (0.0023 * temp * (100 - humidity) + 0.1 * wind);
    }
    void adjustIrrigationSchedule() {
        if (precipitationInches > 0.1) {
            // TODO: reduce irrigation duration
        }
    }
};
