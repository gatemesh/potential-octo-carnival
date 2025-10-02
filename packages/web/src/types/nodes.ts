import { NodeType, IrrigationState } from './irrigation';

export interface NodeInfo {
  nodeId: number;
  type: NodeType;
  zoneId: number;
  fieldId: number;
  locationName: string;
  state: IrrigationState;
  lastSeen: number;
  battery: number;
  solar: number;
  rssi: number;
  firmwareVersion?: string;
  hardwareVersion?: string;
}

export interface NodeConfig {
  nodeId: number;
  role: NodeType;
  zoneId: number;
  fieldId: number;
  locationName: string;
  calibration?: {
    waterLevelOffset?: number;
    pressureOffset?: number;
    flowCalibration?: number;
  };
  alerts?: {
    lowBattery?: number;
    highWaterLevel?: number;
    lowWaterLevel?: number;
  };
}

export interface NetworkTopology {
  nodes: NodeInfo[];
  connections: Array<{
    from: number;
    to: number;
    rssi: number;
    lastSeen: number;
  }>;
}