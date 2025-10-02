// Web Serial API types
declare global {
  interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
  }

  interface SerialOptions {
    baudRate: number;
  }

  interface Navigator {
    serial: Serial;
  }

  interface Serial {
    requestPort(): Promise<SerialPort>;
  }
}

export interface SerialConnectionOptions {
  baudRate?: number;
  onData?: (data: string) => void;
  onError?: (error: Error) => void;
}

export interface SerialConnectionState {
  isConnected: boolean;
  isReading: boolean;
  port: SerialPort | null;
}

export interface ParsedSerialData {
  type: string;
  nodeId?: number;
  timestamp: number;
  [key: string]: any;
}

export interface SerialCommand {
  command: string;
  args?: string[];
  timeout?: number;
}

export interface SerialResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}