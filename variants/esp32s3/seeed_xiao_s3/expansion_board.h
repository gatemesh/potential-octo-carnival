/*
 * Seeeduino XIAO Expansion Board v1.0 — Pinout (from board diagram)
 *
 * Compatible MCUs: XIAO SAMD21 / RP2040 / ESP32C3 / ESP32S3 / nRF52840
 *
 * On-board peripherals (from image):
 *   - User Button on D1 (A1)
 *   - Reset Button on RESET
 *   - Passive Buzzer on D3 (A3)
 *   - MicroSD on SPI (CS=D2, SCK=D8, MISO=D9, MOSI=D10)
 *   - OLED 128×64 (I²C @ 0x78), RESET on D0 (A0)
 *   - RTC PCF8563 on I²C (0x51)
 *   - Grove connectors: 4 total → 1×GPIO (A0/D0, A1/D1), 1×UART (D6/D7), 2×I²C (D4/D5)
 *   - Headers for SPI, SWD, power, battery
 */

#pragma once

// ====================================================================================
// XIAO ESP32S3 PIN MAPPING (Arduino core numbering shown in the diagram)
// ====================================================================================
// Digital alias → ESP32S3 GPIO (and XIAO silk alias)
// D0  = GPIO1   (A0)
// D1  = GPIO2   (A1)
// D2  = GPIO3   (A2)
// D3  = GPIO4   (A3)
// D4  = GPIO5   (A4 / SDA)
// D5  = GPIO6   (A5 / SCL)
// D6  = GPIO43  (TX)
// D7  = GPIO44  (RX)
// D8  = GPIO7   (SCK)
// D9  = GPIO8   (MISO)
// D10 = GPIO9   (MOSI)
// RESET: dedicated reset pin on XIAO edge header
// 3V3, 5V (VBUS), GND: as labeled on the board

// ====================================================================================
// I2C BUS (shared by RTC + OLED + 2×Grove I²C)
// ====================================================================================
#define EXPANSION_I2C_SDA_PIN         5   // D4
#define EXPANSION_I2C_SCL_PIN         6   // D5

// RTC - PCF8563T
#define EXPANSION_RTC_PCF8563_ADDR    0x51  // 7-bit

// OLED 128×64 (SSD1306-compatible), I²C address from image (0x78)
#define EXPANSION_OLED_I2C_ADDR       0x78
#define EXPANSION_OLED_RESET_PIN      1     // D0/A0
#define EXPANSION_OLED_WIDTH          128
#define EXPANSION_OLED_HEIGHT         64

// ====================================================================================
// SD CARD (SPI, as labeled on the diagram)
// ====================================================================================
#define EXPANSION_SD_CS_PIN           3   // D2
#define EXPANSION_SD_SCK_PIN          7   // D8
#define EXPANSION_SD_MISO_PIN         8   // D9
#define EXPANSION_SD_MOSI_PIN         9   // D10
// Card-detect not shown as a GPIO in the picture

// ====================================================================================
// BUTTONS (from image)
// ====================================================================================
// User button on D1 → active LOW (to GND)
#define EXPANSION_BUTTON_PIN          2   // D1
#define EXPANSION_BUTTON_ACTIVE_LOW   true
// Reset button on dedicated RESET pin (no GPIO define needed)

// ====================================================================================
// BUZZER (from image)
// ====================================================================================
#define EXPANSION_BUZZER_PIN          4   // D3 (A3), drive HIGH/PWM to sound

// ====================================================================================
// GROVE CONNECTORS (from image; 4 total)
// ====================================================================================
// GPIO Grove (left/bottom in image): A0/D0 & A1/D1
#define EXPANSION_GROVE_GPIO_SIG1     1   // D0 (A0)  — note: also OLED_RST
#define EXPANSION_GROVE_GPIO_SIG2     2   // D1 (A1)  — note: also USER BUTTON

// UART Grove: D6/D7
#define EXPANSION_GROVE_UART_TX_PIN   43  // D6
#define EXPANSION_GROVE_UART_RX_PIN   44  // D7

// Two I²C Groves: both share the same bus D4/D5
#define EXPANSION_GROVE_I2C1_SDA_PIN  5   // D4
#define EXPANSION_GROVE_I2C1_SCL_PIN  6   // D5
#define EXPANSION_GROVE_I2C2_SDA_PIN  5   // D4 (same bus)
#define EXPANSION_GROVE_I2C2_SCL_PIN  6   // D5 (same bus)

// ====================================================================================
// HEADERS / TEST POINTS (as shown around the board)
// ====================================================================================
// SPI header: SCK(D8), MISO(D9), MOSI(D10), plus 3V3/GND nearby (see silk)
// SWD pads: SWCLK, SWDIO, RESET, 3V3, GND (for SAMD21; varies by MCU family)
// Power rails: USB5V, 3V3, GND clearly marked
// Battery: 3.7 V LiPo JST input; on-board PMIC provides SYS_3V3, optional boost 5V

// ====================================================================================
// PIN CONFLICT HINTS (from actual wiring on this board)
// ====================================================================================
// D0 is OLED_RESET and also on GPIO Grove
// D1 is USER BUTTON and also on GPIO Grove
// D2 is SD CS — conflicts if you repurpose D2 while using SD
// D3 drives BUZZER
// D4/D5 are the shared I²C bus used by RTC/OLED and both I²C Groves
// D6/D7 are UART (ESP32S3 strapping pins; avoid pulling low on boot)
// D8/D9/D10 are SPI (used by microSD)

// ====================================================================================
// USAGE EXAMPLES (unchanged, but now aligned to the diagram)
// ====================================================================================
/*

// I2C (RTC + OLED)
Wire.begin(EXPANSION_I2C_SDA_PIN, EXPANSION_I2C_SCL_PIN);

// OLED
#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 display(EXPANSION_OLED_WIDTH, EXPANSION_OLED_HEIGHT, &Wire, EXPANSION_OLED_RESET_PIN);
display.begin(SSD1306_SWITCHCAPVCC, EXPANSION_OLED_I2C_ADDR);

// SD
#include <SD.h>
SPI.begin(EXPANSION_SD_SCK_PIN, EXPANSION_SD_MISO_PIN, EXPANSION_SD_MOSI_PIN, EXPANSION_SD_CS_PIN);
SD.begin(EXPANSION_SD_CS_PIN);

// Button
pinMode(EXPANSION_BUTTON_PIN, INPUT_PULLUP);
bool pressed = !digitalRead(EXPANSION_BUTTON_PIN);

// Buzzer
ledcSetup(0, 2000, 8);
ledcAttachPin(EXPANSION_BUZZER_PIN, 0);
ledcWrite(0, 128);

*/
