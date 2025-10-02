/**
 * Schedule Manager - Create and manage irrigation schedules
 */

import React, { useState } from 'react';
import { IrrigationSchedule } from '@/types/agriculture';
import { NodeScheduleSync } from './NodeScheduleSync';
import { Calendar, Clock, Plus, Trash2, Edit, ToggleLeft, ToggleRight, Play, X, Upload } from 'lucide-react';

interface ScheduleManagerProps {
  pathId: string;
  schedules: IrrigationSchedule[];
  nodeIds: string[]; // Nodes in this path
  onAddSchedule: (schedule: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSchedule: (scheduleId: string, updates: Partial<IrrigationSchedule>) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onClose: () => void;
}

export function ScheduleManager({
  pathId,
  schedules,
  nodeIds,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onClose,
}: ScheduleManagerProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [duration, setDuration] = useState(60);
  const [repeat, setRepeat] = useState<'once' | 'daily' | 'weekly' | 'custom'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function handleOpenEditor(schedule?: IrrigationSchedule) {
    if (schedule) {
      setEditingSchedule(schedule);
      setName(schedule.name);
      setStartTime(schedule.startTime);
      setDuration(schedule.duration);
      setRepeat(schedule.repeat);
      setDaysOfWeek(schedule.daysOfWeek || []);
      setStartDate(schedule.startDate || new Date().toISOString().split('T')[0]);
    } else {
      setEditingSchedule(null);
      setName('');
      setStartTime('06:00');
      setDuration(60);
      setRepeat('daily');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
    setShowEditor(true);
  }

  function handleSaveSchedule() {
    if (!name || !startTime || duration <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const scheduleData: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      enabled: true,
      startTime,
      duration,
      repeat,
      daysOfWeek: repeat === 'weekly' || repeat === 'custom' ? daysOfWeek : undefined,
      startDate,
      runCount: 0,
    };

    if (editingSchedule) {
      onUpdateSchedule(editingSchedule.id, scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }

    setShowEditor(false);
  }

  function toggleDay(day: number) {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  }

  function formatNextRun(timestamp?: number): string {
    if (!timestamp) return 'Not scheduled';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `in ${diffHours}h ${diffMins % 60}m`;
    if (diffMins > 0) return `in ${diffMins}m`;
    return 'Soon';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Node Sync Modal */}
      {showSyncModal && (
        <NodeScheduleSync
          pathId={pathId}
          schedules={schedules}
          nodeIds={nodeIds}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Irrigation Schedules</h2>
            <p className="text-sm text-gray-600 mt-1">
              Automate watering times for this path
            </p>
          </div>
          <div className="flex items-center gap-2">
            {schedules.length > 0 && !showEditor && (
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Sync to Nodes
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showEditor ? (
            <>
              {/* Add Button */}
              <button
                onClick={() => handleOpenEditor()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-green-700 font-semibold mb-4"
              >
                <Plus className="w-5 h-5" />
                Add New Schedule
              </button>

              {/* Schedule List */}
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">No schedules yet</p>
                  <p className="text-sm mt-2">Create a schedule to automate irrigation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        schedule.enabled
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{schedule.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{schedule.startTime}</span>
                            </div>
                            <div>Duration: {schedule.duration} min</div>
                            <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              {schedule.repeat.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateSchedule(schedule.id, { enabled: !schedule.enabled })
                            }
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title={schedule.enabled ? 'Disable' : 'Enable'}
                          >
                            {schedule.enabled ? (
                              <ToggleRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEditor(schedule)}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this schedule?')) {
                                onDeleteSchedule(schedule.id);
                              }
                            }}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Schedule Details */}
                      {schedule.repeat === 'weekly' && schedule.daysOfWeek && (
                        <div className="flex gap-2 mb-2">
                          {dayNames.map((day, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                schedule.daysOfWeek?.includes(idx)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          {schedule.enabled && (
                            <span className="flex items-center gap-1 text-green-700">
                              <Play className="w-3 h-3" />
                              Next run: {formatNextRun(schedule.nextRun)}
                            </span>
                          )}
                          {!schedule.enabled && (
                            <span className="text-gray-500">Disabled</span>
                          )}
                        </div>
                        <div>Ran {schedule.runCount || 0} times</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Schedule Editor */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Watering"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat
                </label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom Days</option>
                </select>
              </div>

              {(repeat === 'weekly' || repeat === 'custom') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of Week
                  </label>
                  <div className="flex gap-2">
                    {dayNames.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDay(idx)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          daysOfWeek.includes(idx)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
