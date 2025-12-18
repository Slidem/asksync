import { QueryCtx as BaseQueryCtx, query } from "../_generated/server";
/* eslint-disable import/order */
import { Doc, Id } from "../_generated/dataModel";
import {
  expandRecurringTimeblocks,
  filterByAnyTag,
  getTimeblocksForUser,
  sortByStartTime,
} from "./helpers";

import { getUserWithGroups } from "../auth/user";
import { v } from "convex/values";

export const listTimeblocks = query({
  args: {
    userId: v.optional(v.string()),
    range: v.object({ start: v.number(), end: v.number() }),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const { orgId, id: authedUserId } = user;
    const userId = args.userId || authedUserId;

    const timeblocks = await getTimeblocksForUser({
      ctx,
      orgId,
      forUserId: userId,
      currentUser: user,
      range: args.range,
    });

    // Add task counts to each timeblock
    const withTaskCounts = await Promise.all(
      timeblocks.map(async (tb) => {
        const taskCount = await getTaskCount(ctx, tb._id, tb, authedUserId);
        return { ...tb, taskCount };
      }),
    );

    return expandRecurringTimeblocks(
      withTaskCounts,
      args.range.start,
      args.range.end,
    );
  },
});

export const getAvailableTimeblocks = query({
  args: {
    userId: v.string(),
    tagIds: v.array(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const { orgId } = user;

    const timeblocks = await getTimeblocksForUser({
      ctx,
      orgId,
      forUserId: args.userId,
      currentUser: user,
      range: { start: args.startDate, end: args.endDate },
    });
    const filtered = filterByAnyTag(timeblocks, args.tagIds);
    return sortByStartTime(filtered);
  },
});

async function getTaskCount(
  ctx: BaseQueryCtx,
  timeblockId: string,
  timeblock: Doc<"timeblocks">,
  userId: string,
): Promise<{ total: number; completed: number } | null> {
  const isOwner = timeblock.createdBy === userId;

  // If not owner and checklists not visible, return null
  if (!isOwner && !timeblock.checklistsVisible) {
    return null;
  }

  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_timeblock", (q) =>
      q.eq("timeblockId", timeblockId as Id<"timeblocks">),
    )
    .collect();

  const completed = tasks.filter((t) => t.completed).length;

  return {
    total: tasks.length,
    completed,
  };
}
