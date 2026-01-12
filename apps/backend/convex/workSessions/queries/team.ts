/* eslint-disable import/order */
import { getUser } from "../../auth/user";
import { query } from "../../_generated/server";

// Get team work status
export const getTeamWorkStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const teamStatus = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .filter((q) => q.neq(q.field("userId"), user.id))
      .collect();

    // Filter out stale statuses (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const activeStatus = teamStatus.filter((s) => s.lastUpdated > oneHourAgo);

    // Get user details and current work info
    const enrichedStatus = await Promise.all(
      activeStatus.map(async (status) => {
        let taskTitle: string | undefined;
        let questionTitle: string | undefined;
        let timeblockTitle: string | undefined;

        if (status.shareDetails) {
          if (status.currentTaskId) {
            const task = await ctx.db.get(status.currentTaskId);
            taskTitle = task?.title;
          }
          if (status.currentQuestionId) {
            const question = await ctx.db.get(status.currentQuestionId);
            questionTitle = question?.title;
          }
          if (status.currentTimeblockId) {
            const timeblock = await ctx.db.get(status.currentTimeblockId);
            timeblockTitle = timeblock?.title;
          }
        }

        return {
          ...status,
          taskTitle,
          questionTitle,
          timeblockTitle,
          timeRemaining: status.expectedEndAt
            ? Math.max(0, status.expectedEndAt - Date.now())
            : undefined,
        };
      }),
    );

    return enrichedStatus;
  },
});
