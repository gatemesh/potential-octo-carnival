#include "graphics/niche/Inputs/TwoButton.h"

void setupNicheGraphics()
{
    LOG_INFO("setupNicheGraphics called");
    // Initialize TwoButton for user button input
    auto button = NicheGraphics::Inputs::TwoButton::getInstance();
    uint8_t buttonPin = button->getUserButtonPin();
    LOG_INFO("Button pin from getUserButtonPin: %d", buttonPin);
    if (buttonPin != 0xFF) {
        button->setWiring(0, buttonPin, true); // Button 0, with internal pullup
        button->setTiming(0, 50, 1000); // Debounce 50ms, longpress 1000ms
        button->start();
        LOG_INFO("TwoButton initialized with pin %d", buttonPin);
    } else {
        LOG_WARN("No user button pin configured");
    }
}