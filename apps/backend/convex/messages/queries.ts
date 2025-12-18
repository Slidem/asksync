import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { getUserWithGroups } from "../auth/user";

// Get messages for a thread
export const getMessagesByThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUserWithGroups(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.orgId !== orgId) {
      throw new ConvexError("Thread not found");
    }

    // Check if user is a participant
    if (!thread.participants.includes(userId)) {
      throw new ConvexError("Not authorized to view messages in this thread");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    return messages.filter((m) => !m.isDeleted);
  },
});
