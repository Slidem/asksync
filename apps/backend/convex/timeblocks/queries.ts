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
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
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
