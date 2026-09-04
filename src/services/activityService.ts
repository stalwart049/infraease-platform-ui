import { mockRequest } from "./api";
import { ACTIVITY_TYPES, addActivity, getActivities } from "./mockDb";
import type { ActivityEntry, ActivityStreamData, ActivityType } from "./types";

/**
 * Works for ANY table/record:
 *   GET  /api/{tableName}/{recordId}/activities
 *   POST /api/{tableName}/{recordId}/activities
 */
export const activityService = {
  async getActivities(tableName: string, recordId: string): Promise<ActivityStreamData> {
    return mockRequest(
      () => ({
        types: ACTIVITY_TYPES,
        entries: [...getActivities(tableName, recordId)],
        can_post: true,
      }),
      320,
    );
  },

  async postActivity(
    tableName: string,
    recordId: string,
    activity: { type: ActivityType; content: string },
  ): Promise<ActivityEntry> {
    return mockRequest(() => addActivity(tableName, recordId, activity), 420);
  },
};
