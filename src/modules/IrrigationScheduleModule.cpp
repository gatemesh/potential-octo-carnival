#include "IrrigationScheduleModule.h"
#include "MeshService.h"
#include "NodeDB.h"
#include "RTC.h"
#include "configuration.h"
#include <time.h>

IrrigationScheduleModule *irrigationScheduleModule;

IrrigationScheduleModule::IrrigationScheduleModule()
    : SinglePortModule("IrrigationSchedule", meshtastic_PortNum_PRIVATE_APP),
      concurrency::OSThread("IrrigationSchedule")
{
    scheduleCount = 0;
    memset(schedules, 0, sizeof(schedules));

    // Load schedules from flash on startup
    loadSchedules();
}

bool IrrigationScheduleModule::addSchedule(const StoredSchedule &schedule)
{
    if (scheduleCount >= MAX_SCHEDULES) {
        LOG_WARN("Cannot add schedule: maximum limit reached (%d)", MAX_SCHEDULES);
        return false;
    }

    // Check if schedule ID already exists
    if (getScheduleById(schedule.id) != nullptr) {
        LOG_WARN("Schedule ID already exists: %s", schedule.id);
        return false;
    }

    memcpy(&schedules[scheduleCount], &schedule, sizeof(StoredSchedule));

    // Calculate next run time
    schedules[scheduleCount].nextRunUnix = calculateNextRun(schedules[scheduleCount]);

    scheduleCount++;

    LOG_INFO("Added schedule: %s (%s)", schedule.name, schedule.id);

    saveSchedules();
    return true;
}

bool IrrigationScheduleModule::updateSchedule(const char *scheduleId, const StoredSchedule &schedule)
{
    for (int i = 0; i < scheduleCount; i++) {
        if (strcmp(schedules[i].id, scheduleId) == 0) {
            memcpy(&schedules[i], &schedule, sizeof(StoredSchedule));
            schedules[i].nextRunUnix = calculateNextRun(schedules[i]);
            schedules[i].updatedAt = getTime();

            LOG_INFO("Updated schedule: %s", scheduleId);

            saveSchedules();
            return true;
        }
    }

    LOG_WARN("Schedule not found: %s", scheduleId);
    return false;
}

bool IrrigationScheduleModule::deleteSchedule(const char *scheduleId)
{
    for (int i = 0; i < scheduleCount; i++) {
        if (strcmp(schedules[i].id, scheduleId) == 0) {
            // Shift remaining schedules
            for (int j = i; j < scheduleCount - 1; j++) {
                memcpy(&schedules[j], &schedules[j + 1], sizeof(StoredSchedule));
            }

            scheduleCount--;
            memset(&schedules[scheduleCount], 0, sizeof(StoredSchedule));

            LOG_INFO("Deleted schedule: %s", scheduleId);

            saveSchedules();
            return true;
        }
    }

    LOG_WARN("Schedule not found: %s", scheduleId);
    return false;
}

bool IrrigationScheduleModule::enableSchedule(const char *scheduleId, bool enable)
{
    for (int i = 0; i < scheduleCount; i++) {
        if (strcmp(schedules[i].id, scheduleId) == 0) {
            schedules[i].enabled = enable;
            schedules[i].updatedAt = getTime();

            if (enable) {
                schedules[i].nextRunUnix = calculateNextRun(schedules[i]);
            }

            LOG_INFO("%s schedule: %s", enable ? "Enabled" : "Disabled", scheduleId);

            saveSchedules();
            return true;
        }
    }

    LOG_WARN("Schedule not found: %s", scheduleId);
    return false;
}

void IrrigationScheduleModule::clearAllSchedules()
{
    scheduleCount = 0;
    memset(schedules, 0, sizeof(schedules));

    LOG_INFO("Cleared all schedules");

    saveSchedules();
}

const StoredSchedule* IrrigationScheduleModule::getSchedule(int index) const
{
    if (index < 0 || index >= scheduleCount) {
        return nullptr;
    }
    return &schedules[index];
}

const StoredSchedule* IrrigationScheduleModule::getScheduleById(const char *scheduleId) const
{
    for (int i = 0; i < scheduleCount; i++) {
        if (strcmp(schedules[i].id, scheduleId) == 0) {
            return &schedules[i];
        }
    }
    return nullptr;
}

void IrrigationScheduleModule::checkSchedules()
{
    uint32_t now = getTime();

    // Check every minute
    if (now - lastCheckTime < 60) {
        return;
    }

    lastCheckTime = now;

    for (int i = 0; i < scheduleCount; i++) {
        if (!schedules[i].enabled) {
            continue;
        }

        if (shouldExecuteSchedule(schedules[i])) {
            executeSchedule(schedules[i]);
        }
    }
}

bool IrrigationScheduleModule::shouldExecuteSchedule(const StoredSchedule &schedule)
{
    if (!schedule.enabled) {
        return false;
    }

    uint32_t now = getTime();

    // Check if we've passed the next run time
    if (now < schedule.nextRunUnix) {
        return false;
    }

    // Check if we've already run this minute (prevent double execution)
    if (now - schedule.lastRunUnix < 60) {
        return false;
    }

    // Check end date
    if (schedule.endDateUnix > 0 && now > schedule.endDateUnix) {
        return false;
    }

    // Get current time info
    time_t rawtime = now;
    struct tm *timeinfo = localtime(&rawtime);

    int currentMinutes = timeinfo->tm_hour * 60 + timeinfo->tm_min;
    int currentDayOfWeek = timeinfo->tm_wday;

    // Check time of day
    if (abs((int)currentMinutes - (int)schedule.startTimeMinutes) > 1) {
        return false;
    }

    // Check day of week for weekly/custom schedules
    if (schedule.repeat == 2 || schedule.repeat == 3) {  // WEEKLY or CUSTOM
        if (schedule.daysOfWeek[currentDayOfWeek] == 0) {
            return false;
        }
    }

    return true;
}

void IrrigationScheduleModule::executeSchedule(const StoredSchedule &schedule)
{
    LOG_INFO("Executing schedule: %s", schedule.name);

    // Update last run and run count
    for (int i = 0; i < scheduleCount; i++) {
        if (strcmp(schedules[i].id, schedule.id) == 0) {
            schedules[i].lastRunUnix = getTime();
            schedules[i].runCount++;
            schedules[i].nextRunUnix = calculateNextRun(schedules[i]);
            break;
        }
    }

    // Send schedule started event
    sendScheduleEvent(schedule.id, schedule.name, 0, "");  // STARTED

    // TODO: Trigger actual irrigation action
    // This would activate valves, pumps, etc. based on node type
    // For now, we just log and send events

    LOG_INFO("Schedule %s will run for %d minutes", schedule.name, schedule.durationMinutes);

    // After duration completes (in a real implementation, this would be async)
    // sendScheduleEvent(schedule.id, schedule.name, 1, "");  // COMPLETED

    saveSchedules();
}

uint32_t IrrigationScheduleModule::calculateNextRun(const StoredSchedule &schedule)
{
    uint32_t now = getTime();
    time_t rawtime = now;
    struct tm *timeinfo = localtime(&rawtime);

    // Set to today at the scheduled time
    timeinfo->tm_hour = schedule.startTimeMinutes / 60;
    timeinfo->tm_min = schedule.startTimeMinutes % 60;
    timeinfo->tm_sec = 0;

    time_t nextRun = mktime(timeinfo);

    // If the time has already passed today, move to tomorrow
    if (nextRun <= now) {
        nextRun += 86400;  // Add 24 hours
        timeinfo = localtime(&nextRun);
    }

    // For weekly/custom schedules, find the next valid day
    if (schedule.repeat == 2 || schedule.repeat == 3) {  // WEEKLY or CUSTOM
        int daysChecked = 0;
        while (daysChecked < 7) {
            int dayOfWeek = timeinfo->tm_wday;
            if (schedule.daysOfWeek[dayOfWeek] != 0) {
                break;
            }
            nextRun += 86400;  // Add 24 hours
            timeinfo = localtime(&nextRun);
            daysChecked++;
        }
    }

    // For ONCE, don't schedule another run
    if (schedule.repeat == 0 && schedule.runCount > 0) {
        return 0xFFFFFFFF;  // Never run again
    }

    return nextRun;
}

void IrrigationScheduleModule::sendScheduleEvent(const char *scheduleId, const char *name, uint8_t eventType, const char *message)
{
    // TODO: Send schedule event as a mesh packet
    // This would use the ScheduleEvent protobuf message

    LOG_INFO("Schedule event: %s - type %d", name, eventType);
}

void IrrigationScheduleModule::loadSchedules()
{
    // TODO: Load from flash storage
    // For now, schedules will be lost on reboot
    LOG_INFO("Loading schedules from flash (not implemented)");
}

void IrrigationScheduleModule::saveSchedules()
{
    // TODO: Save to flash storage
    LOG_INFO("Saving %d schedules to flash (not implemented)", scheduleCount);
}

bool IrrigationScheduleModule::handleReceived(const meshtastic_MeshPacket &mp)
{
    // TODO: Handle incoming schedule commands
    // Parse ScheduleCommand protobuf and execute the appropriate action

    return false;  // Let other modules handle it too
}

int32_t IrrigationScheduleModule::runOnce()
{
    // Check schedules every minute
    checkSchedules();

    return 60000;  // Run every 60 seconds
}
