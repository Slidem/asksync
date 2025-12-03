import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message in a thread
export const sendMessage = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
    contentPlaintext: v.optional(v.string()),
    messageType: v.optional(v.union(v.literal("text"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.orgId !== orgId) {
      throw new ConvexError("Thread not found");
    }

    // Check if user is a participant
    if (!thread.participants.includes(identity.subject)) {
      throw new ConvexError("Not authorized to send messages in this thread");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      contentPlaintext: args.contentPlaintext,
      messageType: args.messageType || "text",
      attachments: [],
      threadId: args.threadId,
      createdBy: identity.subject,
      orgId,
      isAcceptedAnswer: false,
      isDeleted: false,
    });

    // Update thread's last message time
    await ctx.db.patch(args.threadId, {
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Get the question and update its unread status
    const question = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .first();

    if (question) {
      // Mark as unread for all participants except the sender
      const newUnreadBy = question.participantIds.filter(
        (id) => id !== identity.subject,
      );

      // Update question status if needed
      let newStatus = question.status;
      if (question.status === "assigned") {
        newStatus = "in_progress";
      }

      await ctx.db.patch(question._id, {
        unreadBy: newUnreadBy,
        status: newStatus,
        messageCount: (question.messageCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }

    return messageId;
  },
});

// Get messages for a thread
export const getMessagesByThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.orgId !== orgId) {
      throw new ConvexError("Thread not found");
    }

    // Check if user is a participant
    if (!thread.participants.includes(identity.subject)) {
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

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    contentPlaintext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.orgId !== orgId) {
      throw new ConvexError("Message not found");
    }

    // Only sender can edit their own messages
    if (message.createdBy !== identity.subject) {
      throw new ConvexError("You can only edit your own messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      contentPlaintext: args.contentPlaintext,
      editedAt: Date.now(),
    });

    return args.messageId;
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.orgId !== orgId) {
      throw new ConvexError("Message not found");
    }

    // Only sender can delete their own messages
    if (message.createdBy !== identity.subject) {
      throw new ConvexError("You can only delete your own messages");
    }

    // If this was an accepted answer, update the question
    if (message.isAcceptedAnswer) {
      const question = await ctx.db
        .query("questions")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .filter((q) => q.eq(q.field("threadId"), message.threadId))
        .first();

      if (question) {
        const newAcceptedAnswers = question.acceptedAnswers.filter(
          (id) => id !== args.messageId,
        );

        const hasAnyAnswers =
          newAcceptedAnswers.length > 0 || question.manualAnswer !== undefined;

        // Update status based on remaining answers
        let newStatus = question.status;
        if (!hasAnyAnswers) {
          newStatus = question.assigneeIds.length > 0 ? "assigned" : "pending";
        }

        await ctx.db.patch(question._id, {
          acceptedAnswers: newAcceptedAnswers,
          status: newStatus,
          messageCount: Math.max(0, (question.messageCount || 0) - 1),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      isAcceptedAnswer: false,
      acceptedBy: undefined,
      acceptedAt: undefined,
    });

    return args.messageId;
  },
});
