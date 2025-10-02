/**
 * Node Schedule Sync - Send schedules to irrigation nodes
 */

import React, { useState } from 'react';
import { IrrigationSchedule } from '@/types/agriculture';
import { useNodeStore } from '@/store/nodeStore';
import { Upload, Check, X, AlertCircle, Wifi, WifiOff, Loader } from 'lucide-react';

interface NodeScheduleSyncProps {
  pathId: string;
  schedules: IrrigationSchedule[];
  nodeIds: string[]; // Nodes in this irrigation path
  onClose: () => void;
}

interface SyncStatus {
  nodeId: string;
  status: 'pending' | 'syncing' | 'success' | 'error';
  message?: string;
  schedulesCount?: number;
}

export function NodeScheduleSync({ pathId, schedules, nodeIds, onClose }: NodeScheduleSyncProps) {
  const nodes = useNodeStore((state) => state.nodes);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>(
    nodeIds.map((nodeId) => ({
      nodeId,
      status: 'pending',
    }))
  );
  const [issyncing, setIsSyncing] = useState(false);

  const pathNodes = nodeIds
    .map((nodeId) => nodes.get(nodeId))
    .filter((node) => node !== undefined);

  function convertScheduleToProtobuf(schedule: IrrigationSchedule) {
    // Convert HH:MM to minutes since midnight
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    const startTimeMinutes = hours * 60 + minutes;

    // Convert repeat enum
    const repeatMap = {
      once: 0,
      daily: 1,
      weekly: 2,
      custom: 3,
    };

    // Convert dates to unix timestamps
    const startDateUnix = schedule.startDate
      ? Math.floor(new Date(schedule.startDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const endDateUnix = schedule.endDate
      ? Math.floor(new Date(schedule.endDate).getTime() / 1000)
      : 0;

    return {
      id: schedule.id,
      name: schedule.name,
      enabled: schedule.enabled,
      startTimeMinutes,
      durationMinutes: schedule.duration,
      repeat: repeatMap[schedule.repeat],
      daysOfWeek: schedule.daysOfWeek || [],
      startDateUnix,
      endDateUnix,
      lastRunUnix: schedule.lastRun ? Math.floor(schedule.lastRun / 1000) : 0,
      nextRunUnix: schedule.nextRun ? Math.floor(schedule.nextRun / 1000) : 0,
      runCount: schedule.runCount || 0,
      createdAt: Math.floor(schedule.createdAt / 1000),
      updatedAt: Math.floor(schedule.updatedAt / 1000),
    };
  }

  async function syncScheduleToNode(nodeId: string): Promise<void> {
    // Update status to syncing
    setSyncStatuses((prev) =>
      prev.map((s) => (s.nodeId === nodeId ? { ...s, status: 'syncing' } : s))
    );

    try {
      // Convert schedules to protobuf format
      const protobufSchedules = schedules.map(convertScheduleToProtobuf);

      // In a real implementation, this would:
      // 1. Encode the schedules as protobuf messages
      // 2. Send via serial/BLE/HTTP to the node
      // 3. Wait for confirmation response

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, simulate success
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        setSyncStatuses((prev) =>
          prev.map((s) =>
            s.nodeId === nodeId
              ? {
                  ...s,
                  status: 'success',
                  message: `Synced ${schedules.length} schedules`,
                  schedulesCount: schedules.length,
                }
              : s
          )
        );
      } else {
        throw new Error('Node did not respond');
      }
    } catch (error) {
      setSyncStatuses((prev) =>
        prev.map((s) =>
          s.nodeId === nodeId
            ? {
                ...s,
                status: 'error',
                message: error instanceof Error ? error.message : 'Sync failed',
              }
            : s
        )
      );
    }
  }

  async function handleSyncAll() {
    setIsSyncing(true);

    // Sync to all nodes sequentially
    for (const nodeId of nodeIds) {
      await syncScheduleToNode(nodeId);
    }

    setIsSyncing(false);
  }

  async function handleSyncOne(nodeId: string) {
    setIsSyncing(true);
    await syncScheduleToNode(nodeId);
    setIsSyncing(false);
  }

  const allSuccess = syncStatuses.every((s) => s.status === 'success');
  const anyError = syncStatuses.some((s) => s.status === 'error');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sync Schedules to Nodes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} to irrigation
              nodes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={issyncing}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Schedule Summary */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Schedules to Sync:</h3>
            <ul className="space-y-1">
              {schedules.map((schedule) => (
                <li key={schedule.id} className="text-sm text-gray-700">
                  • {schedule.name} ({schedule.startTime}, {schedule.duration} min,{' '}
                  {schedule.repeat})
                </li>
              ))}
            </ul>
          </div>

          {/* Node List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Target Nodes ({nodeIds.length}):</h3>

            {syncStatuses.map((syncStatus) => {
              const node = nodes.get(syncStatus.nodeId);
              const nodeName = node?.userGivenName || node?.id || syncStatus.nodeId;
              const isOnline = node?.isOnline || false;

              return (
                <div
                  key={syncStatus.nodeId}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    syncStatus.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : syncStatus.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : syncStatus.status === 'syncing'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Status Icon */}
                      {syncStatus.status === 'pending' && (
                        <Upload className="w-5 h-5 text-gray-400" />
                      )}
                      {syncStatus.status === 'syncing' && (
                        <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      {syncStatus.status === 'success' && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                      {syncStatus.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}

                      {/* Node Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{nodeName}</p>
                          {isOnline ? (
                            <Wifi className="w-4 h-4 text-green-600" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {syncStatus.message && (
                          <p className="text-sm text-gray-600 mt-1">{syncStatus.message}</p>
                        )}
                      </div>

                      {/* Sync Button */}
                      {syncStatus.status === 'pending' && (
                        <button
                          onClick={() => handleSyncOne(syncStatus.nodeId)}
                          disabled={issyncing || !isOnline}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sync
                        </button>
                      )}

                      {syncStatus.status === 'error' && (
                        <button
                          onClick={() => handleSyncOne(syncStatus.nodeId)}
                          disabled={issyncing || !isOnline}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Summary */}
          {allSuccess && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="w-5 h-5" />
                <p className="font-semibold">All schedules synced successfully!</p>
              </div>
            </div>
          )}

          {anyError && !allSuccess && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-semibold">Some nodes failed to sync. Check connections and retry.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={issyncing}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {allSuccess ? 'Done' : 'Cancel'}
          </button>

          {!allSuccess && (
            <button
              onClick={handleSyncAll}
              disabled={issyncing}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {issyncing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Sync All Nodes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
