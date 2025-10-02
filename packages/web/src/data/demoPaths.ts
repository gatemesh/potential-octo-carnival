/**
 * Demo Irrigation Paths for testing
 */

import { IrrigationPath } from '@/types/agriculture';

export function createDemoPaths(): IrrigationPath[] {
  const now = Date.now();

  return [
    {
      id: 'path-north-field',
      name: 'North Field Main Line',
      description: 'Primary irrigation line for the north field section',
      farmId: 'farm-1',
      nodes: [
        {
          nodeId: '!a1b2c3d4',
          order: 0,
          type: 'source',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!e5f6g7h8',
          order: 1,
          type: 'pump',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!i9j0k1l2',
          order: 2,
          type: 'valve',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!m3n4o5p6',
          order: 3,
          type: 'sensor',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!q7r8s9t0',
          order: 4,
          type: 'endpoint',
          status: 'ok',
          isActive: false,
        },
      ],
      connections: [
        {
          from: '!a1b2c3d4',
          to: '!e5f6g7h8',
          type: 'pipe',
          size: 6,
          isFlowing: false,
        },
        {
          from: '!e5f6g7h8',
          to: '!i9j0k1l2',
          type: 'pipe',
          size: 4,
          isFlowing: false,
        },
        {
          from: '!i9j0k1l2',
          to: '!m3n4o5p6',
          type: 'pipe',
          size: 4,
          isFlowing: false,
        },
        {
          from: '!m3n4o5p6',
          to: '!q7r8s9t0',
          type: 'pipe',
          size: 3,
          isFlowing: false,
        },
      ],
      status: 'idle',
      isFlowing: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'path-south-field',
      name: 'South Field Irrigation',
      description: 'Secondary irrigation path for south field',
      farmId: 'farm-1',
      nodes: [
        {
          nodeId: '!a1b2c3d4',
          order: 0,
          type: 'source',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!u1v2w3x4',
          order: 1,
          type: 'valve',
          status: 'ok',
          isActive: false,
        },
        {
          nodeId: '!y5z6a7b8',
          order: 2,
          type: 'endpoint',
          status: 'ok',
          isActive: false,
        },
      ],
      connections: [
        {
          from: '!a1b2c3d4',
          to: '!u1v2w3x4',
          type: 'pipe',
          size: 4,
          isFlowing: false,
        },
        {
          from: '!u1v2w3x4',
          to: '!y5z6a7b8',
          type: 'pipe',
          size: 3,
          isFlowing: false,
        },
      ],
      status: 'idle',
      isFlowing: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
