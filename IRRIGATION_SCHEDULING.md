# GateMesh Irrigation Scheduling System

## Overview

The GateMesh irrigation scheduling system allows you to create automated watering schedules in the web interface and transmit them to nodes for local execution. This ensures irrigation continues even if the gateway or internet connection is lost.

## Architecture

### Web Interface (gatemesh-web)
- **Schedule Manager**: Create, edit, and manage irrigation schedules
- **Node Sync**: Transmit schedules to nodes via protobuf messages
- **Path Store**: Persist schedules locally in browser storage

### Firmware (ESP32)
- **IrrigationScheduleModule**: Stores up to 10 schedules per node
- **Schedule Execution**: Checks every minute and triggers irrigation
- **Flash Storage**: Persists schedules across reboots (planned)

### Protocol (Protobufs)
- **IrrigationSchedule**: Schedule definition with time, recurrence, etc.
- **ScheduleCommand**: Commands to add/update/delete schedules
- **ScheduleResponse**: Confirmation and status from nodes
- **ScheduleEvent**: Real-time events when schedules execute

## How It Works

### 1. Create Schedules in Web Interface

Navigate to **Irrigation Paths** → Select a path → Click **Schedules**

Create a schedule with:
- **Name**: Human-readable identifier
- **Start Time**: When to begin (HH:MM format)
- **Duration**: How long to run (minutes)
- **Repeat**: Once, Daily, Weekly, or Custom days
- **Days of Week**: Which days to run (for Weekly/Custom)
- **Start Date**: When to begin schedule

### 2. Sync Schedules to Nodes

Click **"Sync to Nodes"** button to transmit schedules to all nodes in the irrigation path.

The sync process:
1. Converts web schedules to protobuf format
2. Sends `ScheduleCommand` (ADD_SCHEDULE) to each node
3. Waits for `ScheduleResponse` confirmation
4. Shows success/error status for each node

### 3. Node Stores Schedules Locally

When a node receives schedules:
1. Validates schedule data
2. Stores in RAM (up to 10 schedules)
3. Persists to flash storage (prevents loss on reboot)
4. Calculates next run time
5. Sends confirmation back to gateway

### 4. Node Executes Schedules

The `IrrigationScheduleModule` runs every minute:
1. Checks if any enabled schedule should run
2. Verifies time, date, and day-of-week match
3. Triggers irrigation hardware (valves, pumps, etc.)
4. Sends `ScheduleEvent` (STARTED) to gateway
5. Runs for specified duration
6. Sends `ScheduleEvent` (COMPLETED) to gateway
7. Calculates next run time

### 5. Real-Time Updates

The web interface receives schedule events and displays:
- When schedules start/complete
- Any errors or failures
- Run count and history
- Next scheduled run time

## Schedule Types

### Once
Runs one time at the specified date/time, then disables.

### Daily
Runs every day at the specified time.

### Weekly
Runs on specific days of the week (e.g., Mon, Wed, Fri).

### Custom
Runs on any combination of days you choose.

## Protobuf Messages

### IrrigationSchedule
```proto
message IrrigationSchedule {
    string id = 1;
    string name = 2;
    bool enabled = 3;
    uint32 start_time_minutes = 4;      // Minutes since midnight
    uint32 duration_minutes = 5;
    ScheduleRepeat repeat = 6;
    repeated uint32 days_of_week = 7;   // 0=Sunday, 1=Monday, etc.
    uint64 start_date_unix = 8;
    uint64 end_date_unix = 9;
    uint64 last_run_unix = 10;
    uint64 next_run_unix = 11;
    uint32 run_count = 12;
    uint64 created_at = 13;
    uint64 updated_at = 14;
}
```

### ScheduleCommand
```proto
message ScheduleCommand {
    string node_id = 1;
    ScheduleAction action = 2;              // ADD, UPDATE, DELETE, etc.
    IrrigationSchedule schedule = 3;
    string schedule_id = 4;
    bool enable = 5;
}
```

### ScheduleEvent
```proto
message ScheduleEvent {
    string schedule_id = 1;
    string schedule_name = 2;
    uint64 executed_at = 3;
    uint32 duration_minutes = 4;
    ScheduleEventType event_type = 5;      // STARTED, COMPLETED, FAILED
    string message = 6;
}
```

## Node Capacity

- **Maximum Schedules per Node**: 10
- **Storage**: Flash memory (persists across reboots)
- **Execution Frequency**: Checked every 60 seconds
- **Time Accuracy**: ±1 minute

## Features

### Web Interface
- ✅ Create/edit/delete schedules
- ✅ Enable/disable schedules
- ✅ Visual schedule calendar
- ✅ Sync to multiple nodes
- ✅ Sync status per node
- ✅ Schedule conflict detection
- ✅ Next run time display

### Node Firmware
- ✅ Store up to 10 schedules
- ✅ Check schedules every minute
- ✅ Execute irrigation actions
- ✅ Send execution events
- ✅ Calculate next run times
- 🔄 Flash storage persistence (planned)
- 🔄 Hardware control integration (planned)

## Future Enhancements

### Smart Scheduling
- Weather-based adjustments (skip if rain detected)
- Soil moisture-based triggers
- Temperature and humidity considerations
- Sunrise/sunset relative timing

### Advanced Features
- Schedule templates
- Seasonal adjustments
- Zone-based scheduling
- Water budget management
- Schedule conflict resolution
- Historical run analytics

### Hardware Integration
- Direct valve control
- Pump activation
- Flow rate monitoring
- Pressure regulation
- Fault detection and reporting

## Example Workflows

### Simple Daily Watering
1. Create schedule: "Morning Watering"
2. Set time: 06:00
3. Duration: 30 minutes
4. Repeat: Daily
5. Sync to nodes

### Weekend-Only Watering
1. Create schedule: "Weekend Watering"
2. Set time: 08:00
3. Duration: 45 minutes
4. Repeat: Weekly
5. Select: Saturday, Sunday
6. Sync to nodes

### Seasonal Irrigation
1. Create schedule: "Summer Watering"
2. Set time: 05:30
3. Duration: 60 minutes
4. Repeat: Daily
5. Start date: June 1
6. End date: September 30
7. Sync to nodes

## Troubleshooting

### Schedules Not Syncing
- Check node is online (green WiFi icon)
- Verify node firmware is up to date
- Check serial console for error messages

### Schedules Not Executing
- Verify schedule is enabled
- Check node clock is synchronized
- Confirm hardware connections (valves, pumps)
- Review node logs for errors

### Lost Schedules After Reboot
- Flash storage not yet implemented
- Schedules will need to be re-synced
- Future firmware will persist schedules

## Development

### Compiling Protobufs
```bash
# Generate C++ files from agriculture.proto
protoc --nanopb_out=src/mesh/generated protobufs/agriculture.proto

# Regenerate TypeScript types
# (Add protobuf-ts or similar tool)
```

### Testing Schedules
```cpp
// Add test schedule via serial console
StoredSchedule testSchedule;
strcpy(testSchedule.id, "test-1");
strcpy(testSchedule.name, "Test Schedule");
testSchedule.enabled = true;
testSchedule.startTimeMinutes = 360;  // 6:00 AM
testSchedule.durationMinutes = 5;
testSchedule.repeat = 1;  // DAILY
irrigationScheduleModule->addSchedule(testSchedule);
```

### Monitoring Execution
```cpp
// Watch serial output for schedule events
[INFO] Executing schedule: Test Schedule
[INFO] Schedule Test Schedule will run for 5 minutes
[INFO] Schedule event: Test Schedule - type 0
```

## API Reference

### Web Interface

#### Add Schedule
```typescript
const schedule: IrrigationSchedule = {
  name: "Morning Watering",
  enabled: true,
  startTime: "06:00",
  duration: 30,
  repeat: "daily",
  // ... other fields
};
pathStore.addSchedule(pathId, schedule);
```

#### Sync to Node
```typescript
// Convert to protobuf format
const protobufSchedule = {
  id: schedule.id,
  name: schedule.name,
  startTimeMinutes: (hours * 60) + minutes,
  // ... other fields
};

// Send via serial/HTTP/BLE
await sendScheduleCommand(nodeId, "ADD_SCHEDULE", protobufSchedule);
```

### Firmware

#### Add Schedule
```cpp
StoredSchedule schedule;
// ... populate schedule fields
bool success = irrigationScheduleModule->addSchedule(schedule);
```

#### Check Schedules
```cpp
// Called automatically every minute by OSThread
irrigationScheduleModule->checkSchedules();
```

#### Get Schedule
```cpp
const StoredSchedule* schedule = irrigationScheduleModule->getScheduleById("schedule-id");
```

## License

Part of the GateMesh project. See main LICENSE file.
