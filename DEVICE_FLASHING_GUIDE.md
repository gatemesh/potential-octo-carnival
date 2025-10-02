# GateMesh Device Flashing Guide

## Overview

This guide explains how the GateMesh connect tool works and how to flash firmware to ESP32 devices for irrigation automation.

## Table of Contents

1. [Connect Tool Overview](#connect-tool-overview)
2. [How Serial Connection Works](#how-serial-connection-works)
3. [Firmware Flashing Methods](#firmware-flashing-methods)
4. [Step-by-Step Flashing Guide](#step-by-step-flashing-guide)
5. [Configuration After Flashing](#configuration-after-flashing)
6. [Troubleshooting](#troubleshooting)

---

## Connect Tool Overview

The **Connect Tool** in the GateMesh web interface provides a user-friendly way to:
- Connect to ESP32 devices via USB
- Configure node roles (CLIENT, ROUTER, REPEATER, etc.)
- Set node types (VALVE, PUMP, SENSOR, etc.)
- Send commands to devices
- Monitor device telemetry in real-time

### Architecture

```
┌──────────────────────────────────┐
│   GateMesh Web Interface         │
│   (React TypeScript)             │
│                                  │
│  ┌────────────────────────────┐  │
│  │  SerialConnect Component   │  │
│  │  - Connect/Disconnect UI   │  │
│  │  - Node Configuration      │  │
│  │  - Command Sending         │  │
│  └────────────┬───────────────┘  │
│               │                  │
│  ┌────────────▼───────────────┐  │
│  │  useSerialConnection Hook  │  │
│  │  - Web Serial API          │  │
│  │  - Read/Write Serial Data │  │
│  └────────────┬───────────────┘  │
└───────────────┼──────────────────┘
                │
         Web Serial API
                │
                ▼
        ┌───────────────┐
        │  USB Serial   │
        │     Port      │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  ESP32 Device │
        │  (GateMesh    │
        │   Firmware)   │
        └───────────────┘
```

---

## How Serial Connection Works

### Step 1: User Clicks "Connect to Device"

When you click the connect button in the web interface:

```typescript
// src/components/Connect/SerialConnect.tsx
async function handleConnect() {
  try {
    await connect();  // Calls useSerialConnection hook
    addToast({
      type: 'success',
      title: 'Connected',
      message: 'Successfully connected to GateMesh device',
    });
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Connection Failed',
      message: 'Failed to connect to serial device',
    });
  }
}
```

### Step 2: Web Serial API Prompts User

The browser shows a native dialog to select a serial port:

```typescript
// src/hooks/useSerialConnection.ts
const connect = useCallback(async () => {
  try {
    // Request serial port from user
    const selectedPort = await navigator.serial.requestPort();

    // Open port with specified baud rate
    await selectedPort.open({ baudRate: 115200 });

    setPort(selectedPort);
    setIsConnected(true);

    // Start reading data from device
    readLoop(selectedPort);

    console.log('Connected to serial port');
  } catch (error) {
    console.error('Failed to connect:', error);
    onError?.(error as Error);
  }
}, [baudRate, onError]);
```

### Step 3: Serial Read Loop Starts

The hook starts a continuous read loop:

```typescript
const readLoop = useCallback(async (serialPort: SerialPort) => {
  setIsReading(true);
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (serialPort.readable) {
      const reader = serialPort.readable.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Decode incoming bytes
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              onData?.(line.trim());  // Call data handler
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  } catch (error) {
    console.error('Read error:', error);
    onError?.(error as Error);
  } finally {
    setIsReading(false);
  }
}, [onData, onError]);
```

### Step 4: Data Handler Parses Messages

Incoming serial data is parsed and processed:

```typescript
function handleSerialData(line: string) {
  console.log('Received:', line);

  const parsed = parseSerialLine(line);
  if (parsed) {
    switch (parsed.type) {
      case 'battery':
        updateNode(0, {
          battery: parsed.percent!,
          lastSeen: Date.now(),
        });
        break;

      case 'role':
        updateNode(0, {
          role: parsed.role!,
          lastSeen: Date.now(),
        });
        addToast({
          type: 'info',
          title: 'Role Updated',
          message: `Node role set to ${MeshRole[parsed.role!]}`,
        });
        break;

      // ... handle other message types
    }
  }
}
```

### Step 5: Sending Commands

User can send configuration commands:

```typescript
async function handleSetRole() {
  try {
    await write(`set role ${selectedRole}`);
    addToast({
      type: 'info',
      title: 'Role Command Sent',
      message: `Setting node role to ${MeshRole[selectedRole]}`,
    });
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Role Command Failed',
      message: 'Failed to send role configuration command',
    });
  }
}
```

The write function sends commands over serial:

```typescript
const write = useCallback(async (data: string) => {
  if (!port || !isConnected) {
    throw new Error('Not connected');
  }

  const writer = port.writable!.getWriter();
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(data + '\n'));
  writer.releaseLock();
}, [port, isConnected]);
```

---

## Firmware Flashing Methods

There are **3 ways** to flash GateMesh firmware to ESP32 devices:

### Method 1: PlatformIO CLI (Recommended for Development)

**Best for:** Active development, testing, debugging

```bash
# Flash to connected device
pio run -e seeed_xiao_esp32s3 -t upload

# Flash and open serial monitor
pio run -e seeed_xiao_esp32s3 -t upload && pio device monitor
```

**How it works:**
1. PlatformIO compiles C++ code to binary
2. Uses esptool.py to flash via USB
3. Automatically detects serial port
4. Uploads firmware.bin to ESP32 flash memory

### Method 2: esptool.py Direct (Recommended for Production)

**Best for:** Flashing pre-compiled firmware, production deployment

```bash
# Erase flash first (recommended)
esptool.py --chip esp32s3 --port COM5 erase_flash

# Flash firmware
esptool.py --chip esp32s3 --port COM5 --baud 460800 \
  --before default_reset --after hard_reset write_flash \
  -z --flash_mode dio --flash_freq 80m --flash_size 8MB \
  0x0 .pio/build/seeed_xiao_esp32s3/firmware.factory.bin
```

**Parameters explained:**
- `--chip esp32s3`: ESP32-S3 chip type
- `--port COM5`: Serial port (use `COM5` on Windows, `/dev/ttyUSB0` on Linux)
- `--baud 460800`: Upload speed (faster = quicker flash)
- `--flash_mode dio`: Dual I/O SPI mode (most compatible)
- `--flash_freq 80m`: Flash frequency
- `--flash_size 8MB`: Total flash size on chip
- `0x0`: Flash address (start of memory)
- `firmware.factory.bin`: Complete firmware image with bootloader

### Method 3: Web-Based Flashing (Future Enhancement)

**Best for:** End users, no technical knowledge required

Not yet implemented, but planned:

```
Web Interface → Web Serial API → esptool-js → ESP32
```

Benefits:
- No command line needed
- Works in browser
- Guided setup wizard
- Automatic configuration

---

## Step-by-Step Flashing Guide

### Prerequisites

1. **Hardware:**
   - ESP32 device (ESP32-S3 recommended)
   - USB-C or Micro-USB cable
   - Computer (Windows/Mac/Linux)

2. **Software:**
   - Python 3.7+
   - PlatformIO Core or esptool.py
   - USB drivers (CP2102, CH340, or FTDI)

3. **Check USB drivers:**

   **Windows:**
   ```bash
   # Check Device Manager for:
   # - Ports (COM & LPT)
   # - Look for "USB Serial Port (COM5)" or similar
   ```

   **Linux:**
   ```bash
   ls /dev/ttyUSB* /dev/ttyACM*
   # Should see: /dev/ttyUSB0 or /dev/ttyACM0

   # Add user to dialout group (required)
   sudo usermod -a -G dialout $USER
   # Logout and login again
   ```

   **Mac:**
   ```bash
   ls /dev/cu.*
   # Should see: /dev/cu.usbserial-* or /dev/cu.SLAB_USBtoUART
   ```

### Installing esptool.py

```bash
# Install via pip
pip install esptool

# Verify installation
esptool.py version
```

### Flashing Process

#### Step 1: Build Firmware

```bash
cd firmware/
pio run -e seeed_xiao_esp32s3
```

This creates:
- `.pio/build/seeed_xiao_esp32s3/firmware.bin` - Main application
- `.pio/build/seeed_xiao_esp32s3/firmware.factory.bin` - Complete image with bootloader
- `.pio/build/seeed_xiao_esp32s3/firmware.elf` - Debug symbols

#### Step 2: Connect Device

1. Plug ESP32 into USB port
2. Put device in **bootloader mode**:
   - **ESP32-S3:** Hold BOOT button, press RESET, release BOOT
   - **Auto-reset boards:** No action needed
3. Verify connection:
   ```bash
   # Windows
   pio device list

   # Linux/Mac
   ls -l /dev/ttyUSB* /dev/ttyACM*
   ```

#### Step 3: Erase Flash (First Time Only)

```bash
esptool.py --chip esp32s3 --port COM5 erase_flash
```

**Expected output:**
```
esptool.py v4.7
Serial port COM5
Connecting....
Chip is ESP32-S3 (revision v0.2)
Features: WiFi, BLE
Crystal is 40MHz
MAC: 34:85:18:91:23:ac
Uploading stub...
Running stub...
Stub running...
Erasing flash (this may take a while)...
Chip erase completed successfully in 15.3s
Hard resetting via RTS pin...
```

#### Step 4: Flash Firmware

```bash
esptool.py --chip esp32s3 --port COM5 --baud 460800 \
  --before default_reset --after hard_reset write_flash \
  -z --flash_mode dio --flash_freq 80m --flash_size 8MB \
  0x0 .pio/build/seeed_xiao_esp32s3/firmware.factory.bin
```

**Expected output:**
```
esptool.py v4.7
Serial port COM5
Connecting....
Chip is ESP32-S3
Features: WiFi, BLE
Crystal is 40MHz
MAC: 34:85:18:91:23:ac
Uploading stub...
Running stub...
Stub running...
Configuring flash size...
Flash will be erased from 0x00000000 to 0x00213fff...
Compressed 2177184 bytes to 1456789...
Wrote 2177184 bytes (1456789 compressed) at 0x00000000 in 34.2 seconds...
Hash of data verified.

Leaving...
Hard resetting via RTS pin...
```

#### Step 5: Verify Flashing

Open serial monitor to see boot messages:

```bash
# Using PlatformIO
pio device monitor --baud 115200 --filter colorize

# Using screen (Linux/Mac)
screen /dev/ttyUSB0 115200

# Using PuTTY (Windows)
# Open PuTTY, select Serial, COM5, 115200 baud
```

**Expected boot output:**
```
ESP-ROM:esp32s3-20210327
Build:Mar 27 2021
rst:0x1 (POWERON),boot:0x8 (SPI_FAST_FLASH_BOOT)
SPIWP:0xee
mode:DIO, clock div:1
load:0x3fce2810,len:0x178c
load:0x403c8700,len:0x4
load:0x403c8704,len:0x2c68
entry 0x403c8908

[INFO] GateMesh Starting...
[INFO] Hardware: Seeed XIAO ESP32-S3
[INFO] Firmware Version: 2.3.0
[INFO] LoRa Frequency: 915.0 MHz
[INFO] Node ID: !a1b2c3d4
[INFO] WiFi: Connecting...
```

---

## Configuration After Flashing

Once firmware is flashed, configure the device via:

### Option 1: Web Serial Connect

1. Open GateMesh web interface: http://localhost:3001
2. Navigate to "Connect" page
3. Click "Connect to Device"
4. Select serial port from browser
5. Configure settings:
   - **Node Role**: CLIENT, ROUTER, REPEATER, etc.
   - **Node Type**: VALVE, PUMP, SENSOR, etc.
   - **Name**: User-friendly name
6. Click "Set Role" and "Set Type"

### Option 2: Serial Monitor Commands

```bash
# Connect to serial monitor
pio device monitor --baud 115200

# Send commands:
> set role 2               # Set as ROUTER
> set type 25              # Set as GATE_VALVE
> set name "Valve North 1" # Set custom name
> save                     # Save configuration
> info                     # Show current config
```

### Option 3: Bluetooth (If Enabled)

Use the GateMesh mobile app to configure via Bluetooth.

---

## Troubleshooting

### Issue: "Serial port not found"

**Cause:** USB drivers not installed or device not recognized

**Solution:**
```bash
# Windows: Install drivers
# - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
# - CH340: http://www.wch-ic.com/downloads/CH341SER_EXE.html

# Linux: Check permissions
sudo chmod 666 /dev/ttyUSB0
# Or add user to dialout group:
sudo usermod -a -G dialout $USER

# Verify device detection
pio device list
```

### Issue: "Failed to connect to ESP32"

**Cause:** Device not in bootloader mode

**Solution:**
1. Hold BOOT button
2. Press and release RESET button
3. Release BOOT button
4. Try flashing again within 10 seconds

**Alternative:** Use slower baud rate:
```bash
esptool.py --chip esp32s3 --port COM5 --baud 115200 ...
```

### Issue: "Hash of data verified" but device won't boot

**Cause:** Corrupted flash or wrong flash size

**Solution:**
```bash
# 1. Erase entire flash
esptool.py --chip esp32s3 --port COM5 erase_flash

# 2. Flash again with correct flash size
esptool.py --chip esp32s3 --port COM5 --baud 460800 \
  --before default_reset --after hard_reset write_flash \
  -z --flash_mode dio --flash_freq 80m --flash_size 8MB \
  0x0 .pio/build/seeed_xiao_esp32s3/firmware.factory.bin

# 3. Check serial output for errors
pio device monitor --baud 115200
```

### Issue: "Brownout detector was triggered"

**Cause:** Insufficient power supply

**Solution:**
- Use USB port with more power (blue USB 3.0 ports)
- Try different USB cable (some cables are charge-only)
- Use powered USB hub
- Connect external 5V power supply

### Issue: Device keeps resetting

**Cause:** LoRa module not connected or faulty

**Check:**
```bash
# Monitor serial output
pio device monitor --baud 115200

# Look for errors like:
# [ERROR] LoRa module not found
# [ERROR] SPI communication failed
```

**Solution:**
- Check LoRa module connections (SPI pins)
- Verify antenna is connected (never run LoRa without antenna!)
- Disable LoRa temporarily to test: Add `-D DISABLE_LORA` to build_flags

### Issue: "Web Serial API not supported"

**Cause:** Browser doesn't support Web Serial

**Solution:**
- Use Chrome 89+ or Edge 89+
- Firefox and Safari don't support Web Serial yet
- Alternative: Use PlatformIO's serial monitor instead

### Issue: Configuration not saving

**Cause:** Filesystem not initialized

**Solution:**
```bash
# Reflash with filesystem
pio run -e seeed_xiao_esp32s3 -t uploadfs
```

---

## Advanced Topics

### Custom Partition Table

Edit `boards/your_board.json` to customize flash layout:

```json
"build": {
  "partitions": "custom_partitions.csv"
}
```

Example `custom_partitions.csv`:
```csv
# Name,   Type, SubType, Offset,  Size
nvs,      data, nvs,     0x9000,  0x5000
otadata,  data, ota,     0xe000,  0x2000
app0,     app,  ota_0,   0x10000, 0x200000
app1,     app,  ota_1,   0x210000,0x200000
spiffs,   data, spiffs,  0x410000,0x3F0000
```

### Over-The-Air (OTA) Updates

Flash new firmware wirelessly:

```bash
# Build firmware
pio run -e seeed_xiao_esp32s3

# Upload via WiFi (node must be on same network)
pio run -e seeed_xiao_esp32s3 -t upload --upload-port 192.168.1.100
```

### Factory Reset

Erase all settings and return to defaults:

```bash
# Via serial command
> factory_reset

# Or via esptool
esptool.py --chip esp32s3 --port COM5 erase_region 0x9000 0x6000
```

---

## Firmware Files Explained

| File | Purpose | Size | When to Use |
|------|---------|------|-------------|
| `firmware.bin` | Main application only | ~2 MB | OTA updates |
| `firmware.factory.bin` | Complete image with bootloader | ~2.1 MB | Initial flashing |
| `firmware.elf` | Debug symbols | ~23 MB | Debugging crashes |
| `firmware.map` | Memory map | ~24 MB | Analyzing memory usage |

---

## Next Steps

1. **Configure Node**: Use web interface to set role and type
2. **Test LoRa**: Verify mesh connectivity with other nodes
3. **Add to Network**: Register node in GateMesh web interface
4. **Create Schedule**: Set up irrigation schedules
5. **Monitor**: Watch telemetry in dashboard

---

## Quick Reference

### Common Commands

```bash
# List serial ports
pio device list

# Build firmware
pio run -e seeed_xiao_esp32s3

# Flash firmware
pio run -e seeed_xiao_esp32s3 -t upload

# Monitor serial
pio device monitor --baud 115200

# Build and flash
pio run -e seeed_xiao_esp32s3 -t upload && pio device monitor

# Erase flash
esptool.py --chip esp32s3 --port COM5 erase_flash

# Check chip info
esptool.py --chip esp32s3 --port COM5 chip_id
```

### Serial Commands

```
info                    # Show node information
set role <0-10>         # Set mesh role
set type <0-350>        # Set node type
set name "<name>"       # Set custom name
set freq 915.0          # Set LoRa frequency (MHz)
set sf 7                # Set spreading factor (7-12)
set bw 125              # Set bandwidth (kHz)
set power 20            # Set TX power (dBm)
save                    # Save configuration
reboot                  # Restart device
factory_reset           # Erase all settings
```

---

## Support

- Documentation: [README.md](README.md)
- LoRa Guide: [LORA_CONNECTION_GUIDE.md](LORA_CONNECTION_GUIDE.md)
- Scheduling: [IRRIGATION_SCHEDULING.md](IRRIGATION_SCHEDULING.md)
- Issues: Open a ticket on GitHub
