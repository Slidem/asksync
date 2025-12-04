import { Doc, Id } from "../_generated/dataModel";
/* eslint-disable import/order */
import {
  decorateResourceWithGrants,
  getPermittedResourcesForType,
} from "../permissions/common";
import {
  expandRecurringTimeblocks,
  filterByAnyTag,
  sortByStartTime,
} from "./helpers";

import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { getUserWithGroups } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";

export const listTimeblocks = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const { orgId, id: authedUserId } = user;
    const userId = args.userId || authedUserId;

    const timeBlocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", orgId).eq("createdBy", userId),
      )
      .collect();

    const filteredTimeblocks = await filterPermittedResources(timeBlocks, ctx);

    const decorated = await decorateResourceWithGrants({
      ctx,
      currentUser: user,
      resourceType: "timeblocks",
      resources: filteredTimeblocks,
    });

    // Add task counts to each timeblock
    const withTaskCounts = await Promise.all(
      decorated.map(async (tb) => {
        const taskCount = await getTaskCount(ctx, tb._id, tb, authedUserId);
        return { ...tb, taskCount };
      }),
    );

    return withTaskCounts;
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

    // Fetch user's timeblocks
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", orgId).eq("createdBy", args.userId),
      )
      .collect();

    // Filter by permissions
    const permittedTimeblocks = await filterPermittedResources(timeblocks, ctx);

    // Expand recurring timeblocks
    const expanded = expandRecurringTimeblocks(
      permittedTimeblocks,
      args.startDate,
      args.endDate,
    );

    // Filter by tags (ANY match)
    const filtered = filterByAnyTag(expanded, args.tagIds);

    // Sort by earliest availability
    const sorted = sortByStartTime(filtered);

    return sorted;
  },
});

async function filterPermittedResources(
  timeblocks: Doc<"timeblocks">[],
  ctx: BaseQueryCtx,
): Promise<Doc<"timeblocks">[]> {
  const accessibleTimeblockIds = await getPermittedResourcesForType(
    ctx,
    "timeblocks",
    "view",
  );

  return timeblocks.filter((tb) => accessibleTimeblockIds.includes(tb._id));
}

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
