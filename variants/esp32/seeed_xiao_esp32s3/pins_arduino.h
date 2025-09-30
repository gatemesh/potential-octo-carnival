#ifndef PINS_ARDUINO_H
#define PINS_ARDUINO_H

// Seeed XIAO ESP32-S3 pin mapping for GateMesh irrigation
// Reference: https://wiki.seeedstudio.com/XIAO_ESP32S3_Getting_Started/

// Only define if not already defined by Arduino core
#ifndef NUM_DIGITAL_PINS
#define NUM_DIGITAL_PINS 21
#endif

#ifndef NUM_ANALOG_INPUTS
#define NUM_ANALOG_INPUTS 6
#endif

#ifndef NUM_ANALOG_OUTPUTS
#define NUM_ANALOG_OUTPUTS 0
#endif

// Digital pins
#define D0 0
#define D1 1
#define D2 2
#define D3 3
#define D4 4
#define D5 5
#define D6 6
#define D7 7
#define D8 8
#define D9 9
#define D10 10
#define D11 11
#define D12 12
#define D13 13
#define D14 14
#define D15 15
#define D16 16
#define D17 17
#define D18 18
#define D19 19
#define D20 20

// Analog pins
#define A0 1
#define A1 2
#define A2 3
#define A3 4
#define A4 5
#define A5 6

// LED pin
#define LED_BUILTIN 21

// I2C
#define SDA 5
#define SCL 6

// SPI
#define SS 3
#define MOSI 9
#define MISO 8
#define SCK 7

#endif