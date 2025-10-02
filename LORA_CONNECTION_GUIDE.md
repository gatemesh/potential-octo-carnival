# GateMesh LoRa Connection Guide

## Overview

GateMesh supports two methods for connecting to the LoRa mesh network:

1. **USB LoRa Dongle** - Connect a LoRa USB module directly to your computer
2. **Raspberry Pi LoRa HAT** - Use a LoRa HAT attached to a Raspberry Pi via SPI

Both methods allow you to send/receive packets to/from GateMesh irrigation nodes.

## USB LoRa Dongle

### Supported Devices
- Any LoRa module with USB-to-serial interface
- Common chipsets: SX1276, SX1262, RFM95W, RFM96W
- Examples:
  - REYAX RYLR896 (LoRaWAN USB Dongle)
  - Dragino LoRa USB Adapter
  - RAKwireless RAK811 USB
  - Custom ESP32/Arduino with LoRa module

### Requirements
- Modern browser with Web Serial API support
  - ✅ Chrome 89+
  - ✅ Edge 89+
  - ✅ Opera 76+
  - ❌ Firefox (not supported yet)
  - ❌ Safari (not supported yet)

### Connection Steps

1. **Plug in USB dongle** to your computer

2. **Open GateMesh web interface** at http://localhost:3001

3. **Click the LoRa status indicator** in the header
   - Shows "Not Connected" initially

4. **Click "USB LoRa Dongle"**
   - Browser will prompt to select serial port
   - Choose your LoRa device from the list

5. **(Optional) Configure LoRa settings**
   - Expand "Advanced LoRa Settings"
   - Set frequency, bandwidth, spreading factor, etc.
   - Default: 915 MHz, 125 kHz BW, SF7

6. **Connection established!**
   - Status indicator shows signal strength (RSSI)
   - Packet counter shows received/sent packets
   - Click "Send Test Packet" to verify

### Troubleshooting USB

**"No ports found" error:**
- Make sure USB dongle is plugged in
- Check device manager (Windows) or `ls /dev/tty*` (Linux/Mac)
- May need drivers for some USB-serial chips (CH340, CP2102, etc.)

**"Failed to open port" error:**
- Close any other software using the serial port
- Arduino IDE, PuTTY, screen, etc. must be closed
- Only one program can access serial port at a time

**No packets received:**
- Verify LoRa frequency matches your region (915 MHz US, 868 MHz EU)
- Check spreading factor and bandwidth match your nodes
- Ensure antenna is connected
- Check signal strength (RSSI should be better than -100 dBm)

## Raspberry Pi LoRa HAT

### Supported HATs
- Waveshare SX126x LoRa HAT
- Dragino LoRa/GPS HAT
- RAKwireless RAK2245/RAK2287 Pi HAT
- Adafruit RFM95W LoRa Radio Bonnet
- Any HAT using SPI interface (custom pinout may need code changes)

### Requirements
- Raspberry Pi (3, 4, or Zero W)
- LoRa HAT properly installed
- Python 3.7+
- Internet connection (to download packages)

### Installation

1. **Install Python dependencies:**
   ```bash
   sudo apt-get update
   sudo apt-get install python3-pip python3-dev
   sudo pip3 install flask flask-cors
   sudo pip3 install adafruit-circuitpython-rfm9x
   sudo pip3 install RPi.GPIO
   ```

2. **Enable SPI interface:**
   ```bash
   sudo raspi-config
   # Navigate to: Interface Options → SPI → Enable
   sudo reboot
   ```

3. **Copy backend server:**
   ```bash
   cd /opt
   sudo mkdir -p gatemesh
   sudo cp backend/lora_hat_server.py /opt/gatemesh/
   sudo chmod +x /opt/gatemesh/lora_hat_server.py
   ```

4. **Test LoRa HAT:**
   ```bash
   cd /opt/gatemesh
   sudo python3 lora_hat_server.py
   ```

   Should see:
   ```
   [LoRa] Initialized at 915.0 MHz
   [Server] Starting on http://0.0.0.0:5000
   ```

5. **Create systemd service** (auto-start on boot):
   ```bash
   sudo nano /etc/systemd/system/gatemesh-lora.service
   ```

   Paste:
   ```ini
   [Unit]
   Description=GateMesh LoRa HAT Server
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt/gatemesh
   ExecStart=/usr/bin/python3 /opt/gatemesh/lora_hat_server.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

6. **Enable and start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable gatemesh-lora
   sudo systemctl start gatemesh-lora
   ```

7. **Check service status:**
   ```bash
   sudo systemctl status gatemesh-lora
   sudo journalctl -u gatemesh-lora -f
   ```

### Connection Steps

1. **Ensure Raspberry Pi backend is running**
   - Check: http://<pi-ip>:5000/api/health
   - Should return: `{"status":"ok"}`

2. **Open GateMesh web interface**
   - If on same network: http://localhost:3001
   - If remote: http://<pi-ip>:8080 (after running `pnpm preview`)

3. **Click LoRa status indicator** in header

4. **Click "Raspberry Pi HAT"**
   - Sends configuration to backend
   - Backend initializes LoRa radio

5. **Connection established!**
   - Status shows signal strength from HAT
   - Packets received appear in web interface
   - Can send test packets

### Troubleshooting HAT

**Backend won't start:**
```bash
# Check SPI is enabled
lsmod | grep spi
# Should see: spi_bcm2835

# Check HAT is detected
sudo i2cdetect -y 1
# Should see device addresses

# Check Python imports
python3 -c "import board; import busio; import adafruit_rfm9x"
# Should complete without errors
```

**"Failed to initialize LoRa radio" error:**
- Verify HAT is properly seated on GPIO pins
- Check SPI wiring if custom HAT
- Common pins:
  - CE1 (pin 26) for chip select
  - GPIO 25 (pin 22) for reset
  - SPI MOSI/MISO/CLK (pins 19/21/23)

**Web interface can't connect to backend:**
- Check firewall allows port 5000
- Backend must be accessible from web interface
- If using remote Pi, update API URL in web code:
  ```typescript
  // In LoRaConnectionManager.tsx, change:
  const response = await fetch('http://<pi-ip>:5000/api/lora/connect', {
  ```

## LoRa Configuration

### Frequency Selection

**United States (US915):**
- Frequency: 915.0 MHz
- Legal ISM band: 902-928 MHz
- Most common GateMesh setting

**Europe (EU868):**
- Frequency: 868.0 MHz
- Legal ISM band: 863-870 MHz

**Asia/Pacific (AS923):**
- Frequency: 923.0 MHz
- Legal ISM band: 915-928 MHz (varies by country)

### Bandwidth

- **125 kHz** - Recommended, good range/data rate balance
- **250 kHz** - Faster data, shorter range
- **500 kHz** - Fastest data, shortest range

### Spreading Factor (SF)

Lower SF = faster, shorter range
Higher SF = slower, longer range

- **SF7** - Fast, ~2 km range (recommended for dense networks)
- **SF8** - Balanced
- **SF9** - Balanced
- **SF10** - Slower, ~5 km range
- **SF11** - Very slow, ~8 km range
- **SF12** - Slowest, ~10+ km range (best for remote nodes)

### TX Power

- **2-10 dBm** - Low power, battery saving
- **14 dBm** - Medium power
- **17 dBm** - High power
- **20 dBm** - Maximum power (100 mW)

Higher power = longer range but more battery drain

### Coding Rate

Error correction overhead:
- **4/5** - Least overhead, fastest
- **4/6** - Balanced
- **4/7** - More error correction
- **4/8** - Most overhead, most robust (recommended)

## Network Architecture

```
┌─────────────────┐
│  GateMesh Web   │
│   Interface     │
└────────┬────────┘
         │
         ├─── USB ────► LoRa Dongle ─┐
         │                            │
         └─── HTTP ──► Pi Backend ────┤
                         ↓            │
                      Pi LoRa HAT     │
                                      │
                                      ▼
                              ┌───────────────┐
                              │  LoRa Mesh    │
                              │   Network     │
                              └───────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
              │ Irrigation│     │   Pump    │     │   Valve   │
              │   Node    │     │   Node    │     │   Node    │
              └───────────┘     └───────────┘     └───────────┘
```

## Packet Format

GateMesh uses JSON over LoRa for simple parsing:

```json
{
  "from": "!a1b2c3d4",
  "to": "^all",
  "type": "telemetry",
  "payload": {
    "battery": 85,
    "rssi": -45,
    "temp": 22.5
  },
  "timestamp": 1609459200
}
```

### Addressing
- `!xxxxxxxx` - Individual node (hex ID)
- `^all` - Broadcast to all nodes
- `^group-xx` - Group address

## Performance

### Range Estimates

Typical range in open field with good antennas:

| Spreading Factor | Urban    | Suburban | Rural    |
|------------------|----------|----------|----------|
| SF7              | 1-2 km   | 2-3 km   | 3-5 km   |
| SF8              | 1.5-3 km | 3-4 km   | 4-6 km   |
| SF9              | 2-4 km   | 4-5 km   | 5-8 km   |
| SF10             | 3-5 km   | 5-7 km   | 8-10 km  |
| SF11             | 4-6 km   | 6-9 km   | 10-12 km |
| SF12             | 5-8 km   | 8-12 km  | 12-15+ km|

*Actual range depends on terrain, obstacles, antenna height, etc.*

### Data Rates

Approximate max throughput (after overhead):

- SF7, 125 kHz: ~5.5 kbps
- SF8, 125 kHz: ~3.1 kbps
- SF9, 125 kHz: ~1.8 kbps
- SF10, 125 kHz: ~1.0 kbps
- SF11, 125 kHz: ~0.5 kbps
- SF12, 125 kHz: ~0.3 kbps

## Security

**Current Status:** ⚠️ No encryption by default

**Future Enhancements:**
- AES-256 encryption for packets
- Node authentication
- Rolling keys
- Secure bootstrap

**Best Practices:**
- Use private LoRa frequency if possible
- Implement application-level encryption
- Don't send sensitive data over LoRa
- Use VPN for remote access to web interface

## Troubleshooting

### No packets received

1. **Check frequency matches nodes**
   ```bash
   # View current config
   curl http://<pi-ip>:5000/api/lora/stats
   ```

2. **Verify spreading factor matches**
   - All nodes must use same SF

3. **Check antenna connection**
   - Many LoRa modules require antenna before TX
   - Never transmit without antenna (can damage radio)

4. **Test with known-good node**
   - Flash a test node with matching config
   - Place within 10m line-of-sight
   - Should receive packets immediately

### Poor signal quality

- **Move antenna higher** - Even 1-2m height improvement helps significantly
- **Use external antenna** - Better than on-board chip antenna
- **Check for interference** - WiFi, Bluetooth, other 900 MHz devices
- **Adjust TX power** - Try increasing on both sides

### High packet loss

- **Too fast data rate** - Increase spreading factor
- **Signal too weak** - Increase TX power or improve antennas
- **Network congestion** - Too many nodes transmitting simultaneously
- **Enable FEC** - Use coding rate 4/8 for error correction

## Next Steps

- [Irrigation Scheduling Guide](IRRIGATION_SCHEDULING.md)
- [Node Management](gatemesh-web/README.md)
- [Firmware Flashing](FIRMWARE_FLASHING.md)

## Support

For issues or questions:
- GitHub: https://github.com/yourusername/gatemesh
- Check logs: `journalctl -u gatemesh-lora -f`
- Test endpoint: `curl http://localhost:5000/api/health`
