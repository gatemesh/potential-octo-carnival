import { useState, useCallback, useEffect } from 'react';
import { SerialConnectionOptions } from '@/types/serial';

export function useSerialConnection(options: SerialConnectionOptions = {}) {
  const { baudRate = 115200, onData, onError } = options;

  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const connect = useCallback(async () => {
    try {
      // Request serial port
      const selectedPort = await navigator.serial.requestPort();

      // Open port
      await selectedPort.open({ baudRate });

      setPort(selectedPort);
      setIsConnected(true);

      // Start reading
      readLoop(selectedPort);

      console.log('Connected to serial port');
    } catch (error) {
      console.error('Failed to connect:', error);
      onError?.(error as Error);
    }
  }, [baudRate, onError]);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
        setIsConnected(false);
        setIsReading(false);
        console.log('Disconnected from serial port');
      } catch (error) {
        console.error('Failed to disconnect:', error);
        onError?.(error as Error);
      }
    }
  }, [port, onError]);

  const write = useCallback(async (data: string) => {
    if (!port || !isConnected) {
      throw new Error('Not connected');
    }

    const writer = port.writable!.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(data + '\n'));
    writer.releaseLock();
  }, [port, isConnected]);

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

            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                onData?.(line.trim());
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (port) {
        port.close().catch(console.error);
      }
    };
  }, [port]);

  return {
    isConnected,
    isReading,
    connect,
    disconnect,
    write,
  };
}