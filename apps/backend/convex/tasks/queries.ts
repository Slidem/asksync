import { v } from "convex/values";
import { query } from "../_generated/server";
import { hasPermission } from "../permissions/common";

export const list = query({
  args: {
    timeblockId: v.id("timeblocks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) {
      throw new Error("No organization context");
    }

    // Get the timeblock
    const timeblock = await ctx.db.get(args.timeblockId);

    if (!timeblock) {
      throw new Error("Timeblock not found");
    }

    if (timeblock.orgId !== orgId) {
      throw new Error("Timeblock not in organization");
    }

    const isOwner = timeblock.createdBy === userId;

    // Check if user can view the timeblock
    const canView =
      isOwner ||
      (await hasPermission(ctx, "timeblocks", args.timeblockId, "view"));

    if (!canView) {
      throw new Error("You don't have permission to view this timeblock");
    }

    // If not owner and checklists not visible, return empty array
    if (!isOwner && !timeblock.checklistsVisible) {
      return {
        tasks: [],
        isOwner: false,
        canView: false,
      };
    }

    // Get tasks sorted by order
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", args.timeblockId))
      .collect();

    const sortedTasks = tasks.sort((a, b) => a.order - b.order);

    return {
      tasks: sortedTasks,
      isOwner,
      canView: true,
    };
  },
});
