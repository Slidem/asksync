import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getUserWithGroups } from "../../auth/user";
import { getTimeblocksForUser } from "../../timeblocks/helpers";

// Get current timeblock for user
export const getCurrentTimeblocks = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await getUserWithGroups(ctx);
    if (!user) return null;

    const now = Date.now();

    const currentTimeblocks = await getTimeblocksForUser({
      ctx,
      orgId: user.orgId,
      forUserId: user.id,
      currentUser: user,
      currentDate: now,
    });

    if (currentTimeblocks.length === 0) {
      return {
        timeblocks: [],
        tasks: [],
      };
    }

    const tasks = [];

    for (const tb of currentTimeblocks) {
      const tbTasks = await ctx.db
        .query("tasks")
        .withIndex("by_timeblock", (q) => q.eq("timeblockId", tb._id))
        .order("asc")
        .collect();

      tasks.push(...tbTasks);
    }

    return {
      timeblocks: currentTimeblocks,
      tasks: tasks.sort((a, b) => a.order - b.order),
    };
  },
});
