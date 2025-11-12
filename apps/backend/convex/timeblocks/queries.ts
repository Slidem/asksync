/* eslint-disable import/order */
import { getUserWithPermissions } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAccessibleResourceIds } from "../permissions/queries";

export const listTimeblocks = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithPermissions(ctx);
    const { orgId, id: authedUserId, role } = user;
    const userId = args.userId || authedUserId;

    const timeBlocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .collect();

    // Filter by permissions if viewing another user's timeblocks
    if (userId !== authedUserId && role !== "admin") {
      const accessibleTimeblockIds = await getAccessibleResourceIds(
        "timeblocks",
        "view",
        user,
      );

      return timeBlocks.filter((tb) =>
        accessibleTimeblockIds.includes(tb._id),
      );
    }

    return timeBlocks;
  },
});
