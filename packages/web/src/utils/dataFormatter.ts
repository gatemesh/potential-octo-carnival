export function formatWaterLevel(level: number): string {
  return `${level.toFixed(2)} ft`;
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatBattery(voltage: number, percent: number): string {
  return `${voltage.toFixed(2)}V (${percent}%)`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatFlowRate(gallonsPerMinute: number): string {
  return `${gallonsPerMinute.toFixed(1)} GPM`;
}

export function formatPressure(psi: number): string {
  return `${psi.toFixed(1)} PSI`;
}

export function formatRSSI(rssi: number): string {
  return `${rssi} dBm`;
}

export function formatNodeId(nodeId: number): string {
  return `#${nodeId.toString().padStart(3, '0')}`;
}

export function formatZoneId(zoneId: number): string {
  return `Zone ${zoneId}`;
}