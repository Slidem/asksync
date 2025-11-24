/* eslint-disable import/order */
import {
  decorateResourceWithGrants,
  getPermittedResourcesForType,
} from "../permissions/common";

import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { getUserWithGroups } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";
import {
  expandRecurringTimeblocks,
  filterByAnyTag,
  sortByStartTime,
} from "./helpers";

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

    return decorateResourceWithGrants({
      ctx,
      currentUser: user,
      resourceType: "timeblocks",
      resources: filteredTimeblocks,
    });
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
