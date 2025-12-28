import { QueryCtx as BaseQueryCtx, query } from "../_generated/server";
/* eslint-disable import/order */
import { Doc, Id } from "../_generated/dataModel";
import {
  expandRecurringTimeblocks,
  filterByAnyTag,
  getTimeblocksForUser,
  sortByStartTime,
} from "./helpers";

import { decorateResourceWithGrants } from "../permissions/common";
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
    const withTasks = await Promise.all(
      timeblocks.map(async (tb) => {
        const tasks = await getTasksForTimeblock(ctx, tb._id, tb, authedUserId);
        return { ...tb, tasks };
      }),
    );

    const withPermissions = await decorateResourceWithGrants({
      ctx,
      currentUser: user,
      resourceType: "timeblocks",
      resources: withTasks,
    });

    return expandRecurringTimeblocks(
      withPermissions,
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
