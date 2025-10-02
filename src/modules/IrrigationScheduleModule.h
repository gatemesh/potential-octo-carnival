#pragma once

#include "SinglePortModule.h"
#include "concurrency/OSThread.h"
#include "configuration.h"
#include <vector>

/**
 * Irrigation Schedule Module
 *
 * Stores and executes irrigation schedules locally on the node.
 * Schedules are received from the web interface and stored in flash.
 * The module checks every minute if a schedule should be executed.
 */

constexpr uint8_t MAX_SCHEDULES = 10;  // Maximum number of schedules per node

struct StoredSchedule {
    char id[24];                    // Schedule ID
    char name[32];                  // Schedule name
    bool enabled;                   // Enabled flag

    uint16_t startTimeMinutes;      // Minutes since midnight (0-1439)
    uint16_t durationMinutes;       // Duration in minutes

    uint8_t repeat;                 // 0=ONCE, 1=DAILY, 2=WEEKLY, 3=CUSTOM
    uint8_t daysOfWeek[7];          // Bitmask for days (0=Sun, 1=Mon, etc.)
    uint32_t startDateUnix;         // Start date (unix timestamp)
    uint32_t endDateUnix;           // End date (0 = no end)

    uint32_t lastRunUnix;           // Last execution
    uint32_t nextRunUnix;           // Next scheduled execution
    uint32_t runCount;              // Execution count

    uint32_t createdAt;
    uint32_t updatedAt;
};

class IrrigationScheduleModule : public SinglePortModule, private concurrency::OSThread
{
  public:
    IrrigationScheduleModule();

    /**
     * Schedule management
     */
    bool addSchedule(const StoredSchedule &schedule);
    bool updateSchedule(const char *scheduleId, const StoredSchedule &schedule);
    bool deleteSchedule(const char *scheduleId);
    bool enableSchedule(const char *scheduleId, bool enable);
    void clearAllSchedules();

    /**
     * Query schedules
     */
    int getScheduleCount() const { return scheduleCount; }
    const StoredSchedule* getSchedule(int index) const;
    const StoredSchedule* getScheduleById(const char *scheduleId) const;

    /**
     * Execution
     */
    void checkSchedules();
    bool shouldExecuteSchedule(const StoredSchedule &schedule);
    void executeSchedule(const StoredSchedule &schedule);

  protected:
    virtual bool handleReceived(const meshtastic_MeshPacket &mp) override;
    virtual int32_t runOnce() override;

    /**
     * Load/Save schedules from flash
     */
    void loadSchedules();
    void saveSchedules();

    /**
     * Calculate next run time
     */
    uint32_t calculateNextRun(const StoredSchedule &schedule);

    /**
     * Send schedule event
     */
    void sendScheduleEvent(const char *scheduleId, const char *name, uint8_t eventType, const char *message = "");

  private:
    StoredSchedule schedules[MAX_SCHEDULES];
    uint8_t scheduleCount = 0;
    uint32_t lastCheckTime = 0;
};

extern IrrigationScheduleModule *irrigationScheduleModule;
