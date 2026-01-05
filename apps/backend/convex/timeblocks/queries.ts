import {
  QueryCtx as BaseQueryCtx,
  internalQuery,
  query,
} from "../_generated/server";
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

    // Get timeblocks with busy block masking for non-permitted ones
    const timeblocks = await getTimeblocksForUser({
      ctx,
      orgId,
      retrievalMode: "hide_not_allowed_details",
      forUserId: userId,
      currentUser: user,
      range: args.range,
    });

    // Add tasks to visible timeblocks
    const withTasks = await Promise.all(
      timeblocks.map(async (tb) => {
        if (tb.isBusy) {
          return { ...tb, tasks: null };
        }
        const tasks = await getTasksForTimeblock(ctx, tb._id, tb, authedUserId);
        return { ...tb, tasks };
      }),
    );

    return expandRecurringTimeblocks(
      withTasks,
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

async function getTasksForTimeblock(
  ctx: BaseQueryCtx,
  timeblockId: string,
  timeblock: Doc<"timeblocks">,
  userId: string,
) {
  const isOwner = timeblock.createdBy === userId;

  // If not owner and checklists not visible, return null
  if (!isOwner && !timeblock.checklistsVisible) {
    return null;
  }

  return await ctx.db
    .query("tasks")
    .withIndex("by_timeblock", (q) =>
      q.eq("timeblockId", timeblockId as Id<"timeblocks">),
    )
    .collect();
}

// Internal query for actions to get full timeblock data
export const getTimeblockInternal = internalQuery({
  args: { id: v.id("timeblocks") },
  handler: async (ctx, args): Promise<Doc<"timeblocks"> | null> => {
    return await ctx.db.get(args.id);
  },
});
