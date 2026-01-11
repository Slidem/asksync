import { query } from "../_generated/server";
import { getUserWithGroups } from "../auth/user";
import {
  expandRecurringTimeblocks,
  getTimeblocksForUser,
} from "../timeblocks/helpers";

/**
 * Get pending items that should trigger notifications.
 *
 * Notification eligibility:
 * - On-demand tags: Always eligible (response time is fixed)
 * - Scheduled tags: Only if tag matches currently active timeblock
 * - Item must not have been notified already (notifiedAt is null)
 * - Tag must have browserNotificationEnabled or soundNotificationEnabled
 */
export const getPendingItemsForNotification = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserWithGroups(ctx);
    const { id: userId, orgId } = user;
    const now = Date.now();

    // 1. Get current active timeblocks for user (expanded for recurring)
    const timeblocks = await getTimeblocksForUser({
      ctx,
      orgId,
      retrievalMode: "all",
      forUserId: userId,
      currentUser: user,
      currentDate: now,
    });

    // Expand recurring timeblocks to get instances at current time
    const expandedTimeblocks = expandRecurringTimeblocks(
      timeblocks,
      now - 24 * 60 * 60 * 1000, // look back 1 day for recurring
      now + 1000, // just past current time
    ).filter((tb) => tb.startTime <= now && tb.endTime >= now);

    const activeTagIds = new Set(expandedTimeblocks.flatMap((tb) => tb.tagIds));

    // 2. Get all tags with notification settings for this org
    const allTags = await ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const tagMap = new Map(allTags.map((t) => [t._id.toString(), t]));

    // Helper to check if a tag should trigger notifications
    const shouldNotifyForTag = (tagId: string) => {
      const tag = tagMap.get(tagId);
      if (!tag) return { eligible: false, browser: false, sound: false };

      const hasNotification =
        tag.browserNotificationEnabled || tag.soundNotificationEnabled;
      if (!hasNotification)
        return { eligible: false, browser: false, sound: false };

      // On-demand: always eligible
      if (tag.answerMode === "on-demand") {
        return {
          eligible: true,
          browser: tag.browserNotificationEnabled ?? false,
          sound: tag.soundNotificationEnabled ?? false,
        };
      }

      // Scheduled: only if tag in active timeblock
      if (activeTagIds.has(tagId)) {
        return {
          eligible: true,
          browser: tag.browserNotificationEnabled ?? false,
          sound: tag.soundNotificationEnabled ?? false,
        };
      }

      return { eligible: false, browser: false, sound: false };
    };

    // 3. Get unnotified pending questions assigned to user
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const eligibleQuestions = allQuestions
      .filter((q) => {
        // Only pending/assigned status
        if (q.status !== "pending" && q.status !== "assigned") return false;
        // Only if user is assignee
        if (!q.assigneeIds.includes(userId)) return false;
        // Skip if already notified
        if (q.notifiedAt) return false;

        // Check if any tag should trigger notification
        return q.tagIds.some((tagId) => shouldNotifyForTag(tagId).eligible);
      })
      .map((q) => {
        // Aggregate notification types from all tags
        let browser = false;
        let sound = false;
        for (const tagId of q.tagIds) {
          const result = shouldNotifyForTag(tagId);
          if (result.browser) browser = true;
          if (result.sound) sound = true;
        }
        return {
          _id: q._id,
          title: q.title,
          browser,
          sound,
        };
      });

    // 4. Get unnotified pending email attention items
    const allEmailItems = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    const eligibleEmailItems = allEmailItems
      .filter((item) => {
        if (item.status !== "pending") return false;
        if (item.notifiedAt) return false;

        return item.tagIds.some((tagId) => shouldNotifyForTag(tagId).eligible);
      })
      .map((item) => {
        let browser = false;
        let sound = false;
        for (const tagId of item.tagIds) {
          const result = shouldNotifyForTag(tagId);
          if (result.browser) browser = true;
          if (result.sound) sound = true;
        }
        return {
          _id: item._id,
          subject: item.subject,
          senderName: item.senderName || item.senderEmail,
          browser,
          sound,
        };
      });

    return {
      questions: eligibleQuestions,
      emailItems: eligibleEmailItems,
    };
  },
});
