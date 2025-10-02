#!/usr/bin/env python3
"""
GateMesh LoRa HAT Server
Provides HTTP API for Raspberry Pi LoRa HATs (SX1262, SX1276, etc.)

This server runs on the Raspberry Pi and communicates with the LoRa HAT via SPI.
The web interface connects to this server via HTTP to send/receive LoRa packets.

Installation:
    pip3 install flask adafruit-circuitpython-rfm9x RPi.GPIO

Usage:
    python3 lora_hat_server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import queue
import time
import json

# LoRa HAT initialization
try:
    import board
    import busio
    import digitalio
    import adafruit_rfm9x
    LORA_AVAILABLE = True
except ImportError:
    print("[WARNING] LoRa libraries not available. Running in mock mode.")
    LORA_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Allow web interface to connect

# Global state
lora_radio = None
lora_config = {
    'frequency': 915.0,
    'tx_power': 20,
    'bandwidth': 125000,
    'coding_rate': 5,
    'spreading_factor': 7,
}
packet_queue = queue.Queue(maxsize=100)
stats = {
    'packets_received': 0,
    'packets_sent': 0,
    'last_rssi': None,
    'last_snr': None,
}


def init_lora_radio(config):
    """Initialize LoRa radio with given configuration"""
    global lora_radio

    if not LORA_AVAILABLE:
        print("[MOCK] LoRa radio initialized (mock mode)")
        return True

    try:
        # SPI bus
        spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)

        # Chip select and reset pins
        cs = digitalio.DigitalInOut(board.CE1)
        reset = digitalio.DigitalInOut(board.D25)

        # Initialize RFM9x (common LoRa module)
        lora_radio = adafruit_rfm9x.RFM9x(
            spi, cs, reset, config['frequency']
        )

        # Configure radio
        lora_radio.tx_power = config['tx_power']
        lora_radio.signal_bandwidth = config['bandwidth']
        lora_radio.coding_rate = config['coding_rate']
        lora_radio.spreading_factor = config['spreading_factor']
        lora_radio.enable_crc = True

        print(f"[LoRa] Initialized at {config['frequency']} MHz")
        print(f"[LoRa] TX Power: {config['tx_power']} dBm")
        print(f"[LoRa] Bandwidth: {config['bandwidth']/1000} kHz")
        print(f"[LoRa] Spreading Factor: SF{config['spreading_factor']}")

        return True

    except Exception as e:
        print(f"[ERROR] Failed to initialize LoRa radio: {e}")
        return False


def lora_receive_thread():
    """Background thread to receive LoRa packets"""
    global stats

    print("[LoRa RX] Thread started")

    while True:
        try:
            if LORA_AVAILABLE and lora_radio:
                # Receive packet with timeout
                packet = lora_radio.receive(timeout=0.5)

                if packet:
                    # Decode packet
                    try:
                        data = packet.decode('utf-8')
                        rssi = lora_radio.last_rssi
                        snr = lora_radio.last_snr

                        # Update stats
                        stats['packets_received'] += 1
                        stats['last_rssi'] = rssi
                        stats['last_snr'] = snr

                        # Add to queue
                        packet_data = {
                            'data': data,
                            'rssi': rssi,
                            'snr': snr,
                            'timestamp': time.time(),
                        }

                        if not packet_queue.full():
                            packet_queue.put(packet_data)

                        print(f"[LoRa RX] {data} (RSSI: {rssi}, SNR: {snr})")

                    except UnicodeDecodeError:
                        print(f"[LoRa RX] Invalid packet (decode error)")

            else:
                # Mock mode - generate test packets occasionally
                if not LORA_AVAILABLE:
                    time.sleep(5)
                    test_packet = {
                        'data': '{"from":"!12345678","to":"^all","test":true}',
                        'rssi': -45,
                        'snr': 8.5,
                        'timestamp': time.time(),
                    }
                    if not packet_queue.full():
                        packet_queue.put(test_packet)
                        stats['packets_received'] += 1
                        stats['last_rssi'] = test_packet['rssi']
                        stats['last_snr'] = test_packet['snr']

        except Exception as e:
            print(f"[ERROR] RX thread error: {e}")
            time.sleep(1)


# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.route('/api/lora/connect', methods=['POST'])
def connect_lora():
    """Connect to LoRa HAT with configuration"""
    global lora_config

    try:
        data = request.json or {}

        # Update configuration
        if 'frequency' in data:
            lora_config['frequency'] = float(data['frequency'])
        if 'bandwidth' in data:
            lora_config['bandwidth'] = int(data['bandwidth']) * 1000  # Convert to Hz
        if 'spreadingFactor' in data:
            lora_config['spreading_factor'] = int(data['spreadingFactor'])
        if 'codingRate' in data:
            lora_config['coding_rate'] = int(data['codingRate'])
        if 'txPower' in data:
            lora_config['tx_power'] = int(data['txPower'])

        # Initialize radio
        success = init_lora_radio(lora_config)

        if success:
            return jsonify({
                'success': True,
                'deviceName': 'Raspberry Pi LoRa HAT (RFM9x)',
                'config': lora_config,
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to initialize LoRa radio'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/lora/disconnect', methods=['POST'])
def disconnect_lora():
    """Disconnect from LoRa HAT"""
    global lora_radio

    lora_radio = None

    return jsonify({
        'success': True,
        'message': 'Disconnected from LoRa radio'
    })


@app.route('/api/lora/send', methods=['POST'])
def send_lora():
    """Send packet via LoRa"""
    global stats

    try:
        data = request.json
        payload = json.dumps(data)

        if LORA_AVAILABLE and lora_radio:
            # Send packet
            lora_radio.send(bytes(payload, 'utf-8'))
            stats['packets_sent'] += 1

            print(f"[LoRa TX] {payload}")

            return jsonify({
                'success': True,
                'bytes_sent': len(payload)
            })
        else:
            # Mock mode
            print(f"[MOCK TX] {payload}")
            stats['packets_sent'] += 1

            return jsonify({
                'success': True,
                'bytes_sent': len(payload),
                'mock': True
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/lora/poll', methods=['GET'])
def poll_lora():
    """Poll for received packets"""
    packets = []

    # Get all packets from queue (non-blocking)
    while not packet_queue.empty():
        try:
            packet = packet_queue.get_nowait()
            packets.append(packet)
        except queue.Empty:
            break

    return jsonify(packets)


@app.route('/api/lora/stats', methods=['GET'])
def get_stats():
    """Get LoRa statistics"""
    return jsonify({
        'success': True,
        'stats': stats,
        'config': lora_config,
        'connected': lora_radio is not None or not LORA_AVAILABLE,
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'gatemesh-lora-hat',
        'lora_available': LORA_AVAILABLE,
        'connected': lora_radio is not None,
    })


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("GateMesh LoRa HAT Server")
    print("=" * 60)
    print()

    # Start receiver thread
    rx_thread = threading.Thread(target=lora_receive_thread, daemon=True)
    rx_thread.start()

    # Start Flask server
    print("[Server] Starting on http://0.0.0.0:5000")
    print("[Server] Web interface can connect to http://<pi-ip>:5000")
    print()

    app.run(host='0.0.0.0', port=5000, debug=False)
