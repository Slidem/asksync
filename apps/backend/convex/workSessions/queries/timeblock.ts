import { query } from "../../_generated/server";
import { getUser } from "../../auth/user";

// Get current timeblock for user
export const getCurrentTimeblock = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const now = Date.now();

    // Get all timeblocks for the user
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", user.orgId).eq("createdBy", user.id),
      )
      .collect();

    // Find timeblock that contains current time
    // For now, we'll just check non-recurring timeblocks
    // TODO: Handle recurring timeblocks in the future
    const currentTimeblock = timeblocks.find(
      (tb) => tb.startTime <= now && tb.endTime >= now,
    );

    if (!currentTimeblock) return null;

    // Get tasks for this timeblock
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) =>
        q.eq("timeblockId", currentTimeblock._id),
      )
      .order("asc")
      .collect();

    return {
      timeblock: currentTimeblock,
      tasks: tasks.sort((a, b) => a.order - b.order),
    };
  },
});
