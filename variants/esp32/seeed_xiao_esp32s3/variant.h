#ifndef _SEEED_XIAO_ESP32S3_H_
#define _SEEED_XIAO_ESP32S3_H_

#define HW_VENDOR meshtastic_HardwareModel_SEEED_XIAO_S3

// XIAO ESP32-S3 with Wio-SX1262 board-to-board connector
// Based on: https://files.seeedstudio.com/products/SenseCAP/Wio_SX1262/Schematic_Diagram_Wio-SX1262_for_XIAO.pdf

#define I2C_SDA 5
#define I2C_SCL 6

#define BUTTON_PIN 0  // User button on XIAO ESP32-S3
#define BUTTON_ACTIVE_LOW true
#define BUTTON_ACTIVE_PULLUP true

#define LED_STATE_ON 1  // LED is active high on XIAO ESP32-S3
#define LED_PIN 21      // RGB LED on XIAO ESP32-S3 (GPIO21 controls the LED)

// Wio-SX1262 for XIAO with 30-pin board-to-board connector
#define USE_SX1262
#define SX126X_CS 3
#define SX126X_DIO1 0
#define SX126X_BUSY 1
#define SX126X_RESET 2
#define SX126X_RXEN 4
#define SX126X_TXEN RADIOLIB_NC
#define SX126X_DIO2_AS_RF_SWITCH  // DIO2 is used to control the TX side of the RF switch
#define SX126X_DIO3_TCXO_VOLTAGE 1.8

// SPI for SX1262
#define PIN_SPI_MISO 8
#define PIN_SPI_MOSI 9
#define PIN_SPI_SCK 7

// Irrigation system specific pins
#define IRRIGATION_RELAY_1 10  // GPIO10 for relay control
#define IRRIGATION_RELAY_2 11  // GPIO11 for relay control
#define IRRIGATION_SENSOR_1 12  // GPIO12 for soil moisture sensor
#define IRRIGATION_SENSOR_2 13  // GPIO13 for soil moisture sensor

#endif