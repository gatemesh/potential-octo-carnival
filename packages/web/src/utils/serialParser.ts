import { NodeType, MeshRole } from '@/types/irrigation';
import { ParsedSerialData } from '@/types/serial';

export function parseSerialLine(line: string): ParsedSerialData | null {
  // Parse irrigation status messages
  // Example: "INFO | Irrigation status: Water level: 2.45ft, Battery: 78%"

  try {
    // Remove log level prefix
    const cleanLine = line.replace(/^(INFO|DEBUG|WARN|ERROR)\s*\|\s*/, '');

    // Parse water level
    const waterMatch = cleanLine.match(/Water level:\s*([\d.]+)\s*ft/);
    if (waterMatch) {
      return {
        type: 'water_level',
        value: parseFloat(waterMatch[1]),
        timestamp: Date.now(),
      };
    }

    // Parse battery
    const batteryMatch = cleanLine.match(/Battery:\s*([\d.]+)V\s*\((\d+)%\)/);
    if (batteryMatch) {
      return {
        type: 'battery',
        voltage: parseFloat(batteryMatch[1]),
        percent: parseInt(batteryMatch[2]),
        timestamp: Date.now(),
      };
    }

    // Parse role
    const roleMatch = cleanLine.match(/Role:\s*(\w+)/);
    if (roleMatch) {
      return {
        type: 'role',
        role: parseMeshRole(roleMatch[1]),
        timestamp: Date.now(),
      };
    }

    // Parse node type
    const typeMatch = cleanLine.match(/Type:\s*(\w+(?:\s+\w+)*)/);
    if (typeMatch) {
      return {
        type: 'node_type',
        nodeType: parseNodeType(typeMatch[1].replace(/\s+/g, '_')),
        timestamp: Date.now(),
      };
    }

    // Parse node status
    if (cleanLine.includes('Node:')) {
      const nodeMatch = cleanLine.match(/Node:\s*(\w+)/);
      const zoneMatch = cleanLine.match(/Zone:\s*(\d+)/);

      if (nodeMatch && zoneMatch) {
        return {
          type: 'node_status',
          nodeType: parseNodeType(nodeMatch[1]),
          zoneId: parseInt(zoneMatch[1]),
          timestamp: Date.now(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Parse error:', error);
    return null;
  }
}

function parseNodeType(typeStr: string): NodeType {
  const typeMap: Record<string, NodeType> = {
    'UNDEFINED': NodeType.UNDEFINED,
    'HEADGATE_CONTROLLER': NodeType.HEADGATE_CONTROLLER,
    'PUMP_CONTROLLER': NodeType.PUMP_CONTROLLER,
    'SECTION_CONTROLLER': NodeType.SECTION_CONTROLLER,
    'WATER_LEVEL_SENSOR': NodeType.WATER_LEVEL_SENSOR,
    'FLOW_SENSOR': NodeType.FLOW_SENSOR,
    'SOIL_MOISTURE_SENSOR': NodeType.SOIL_MOISTURE_SENSOR,
    'PRESSURE_SENSOR': NodeType.PRESSURE_SENSOR,
    'WEATHER_STATION': NodeType.WEATHER_STATION,
    'GATE_VALVE': NodeType.GATE_VALVE,
    'VARIABLE_VALVE': NodeType.VARIABLE_VALVE,
    'PUMP_RELAY': NodeType.PUMP_RELAY,
    'LATERAL_VALVE': NodeType.LATERAL_VALVE,
  };

  return typeMap[typeStr] || NodeType.UNDEFINED;
}

function parseMeshRole(roleStr: string): MeshRole {
  const roleMap: Record<string, MeshRole> = {
    'CLIENT': MeshRole.CLIENT,
    'CLIENT_MUTE': MeshRole.CLIENT_MUTE,
    'ROUTER': MeshRole.ROUTER,
    'ROUTER_CLIENT': MeshRole.ROUTER_CLIENT,
    'REPEATER': MeshRole.REPEATER,
    'TRACKER': MeshRole.TRACKER,
    'SENSOR': MeshRole.SENSOR,
    'TAK': MeshRole.TAK,
    'CLIENT_HIDDEN': MeshRole.CLIENT_HIDDEN,
    'LOST_AND_FOUND': MeshRole.LOST_AND_FOUND,
    'TAK_TRACKER': MeshRole.TAK_TRACKER,
  };

  return roleMap[roleStr] || MeshRole.CLIENT;
}