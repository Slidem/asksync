/* eslint-disable import/order */
import { getUser } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";

export const listTimeblocks = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // verify auth
    const { orgId, id: authedUserId } = await getUser(ctx);
    const userId = args.userId || authedUserId;
    const timeBlocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .collect();

    // add permission based filtering if needed in the future
    return timeBlocks;
  },
});
