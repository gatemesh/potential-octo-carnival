#ifndef _SEEED_XIAO_ESP32S3_H_
#define _SEEED_XIAO_ESP32S3_H_

#define HW_VENDOR meshtastic_HardwareModel_SEEED_XIAO_S3

// XIAO ESP32-S3 with Wio-SX1262 board-to-board connector
// Based on: https://files.seeedstudio.com/products/SenseCAP/Wio_SX1262/Schematic_Diagram_Wio-SX1262_for_XIAO.pdf

#define I2C_SDA 5
#define I2C_SCL 6

// PCF8563 RTC on expansion board at address 0x51 (7-bit)
#define PCF8563_RTC 0x51

#define BUTTON_PIN 2 // User button on expansion board (was GPIO0 on bare XIAO)
#define BUTTON_ACTIVE_LOW true
#define BUTTON_ACTIVE_PULLUP true

#define LED_STATE_ON 1 // LED is active high on XIAO ESP32-S3
#define LED_PIN 21     // RGB LED on XIAO ESP32-S3 (GPIO21 controls the LED)

// Wio-SX1262 for XIAO with 30-pin board-to-board connector
#define USE_SX1262
#define SX126X_CS 41
#define SX126X_DIO1 39
#define SX126X_BUSY 40
#define SX126X_RESET 42
#define SX126X_RXEN 38
#define SX126X_TXEN RADIOLIB_NC
#define SX126X_DIO2_AS_RF_SWITCH // DIO2 is used to control the TX side of the RF switch
#define SX126X_DIO3_TCXO_VOLTAGE 1.8

// SPI for SX1262 - Seeed XIAO LoRa module
// Force override any previous definitions
#ifdef LORA_SCK
#undef LORA_SCK
#endif
#ifdef LORA_MISO
#undef LORA_MISO
#endif
#ifdef LORA_MOSI
#undef LORA_MOSI
#endif
#ifdef LORA_CS
#undef LORA_CS
#endif
#define LORA_SCK 7
#define LORA_MISO 8
#define LORA_MOSI 9
#define LORA_CS 41

#define PIN_SPI_MISO 8
#define PIN_SPI_MOSI 9
#define PIN_SPI_SCK 7

// Buzzer on A3 (GPIO4)
#define PIN_BUZZER 4

// Irrigation system specific pins
#define IRRIGATION_RELAY_1 10  // GPIO10 for relay control
#define IRRIGATION_RELAY_2 11  // GPIO11 for relay control
#define IRRIGATION_SENSOR_1 12 // GPIO12 for soil moisture sensor
#define IRRIGATION_SENSOR_2 13 // GPIO13 for soil moisture sensor

#endif