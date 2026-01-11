/* eslint-disable import/order */
import { ConvexError, v } from "convex/values";
import {
  calculateExpectedAnswerTime,
  getStatusForQuestion,
  validateTagPermissions,
} from "./helpers";

import { Id } from "../_generated/dataModel";
import { getUserWithGroups } from "../auth/user";
import { mutation } from "../_generated/server";

// Create a new question with thread
export const createQuestion = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    contentPlaintext: v.optional(v.string()),
    tagIds: v.array(v.string()),
    assigneeIds: v.array(v.string()),
    participants: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUserWithGroups(ctx);

    // Validate inputs
    if (args.tagIds.length === 0) {
      throw new ConvexError("At least one tag is required");
    }

    if (args.assigneeIds.length === 0) {
      throw new ConvexError("At least one assignee is required");
    }

    // Validate tag permissions
    const hasTagPermissions = await validateTagPermissions(
      ctx,
      orgId,
      userId,
      args.tagIds as Id<"tags">[],
    );

    if (!hasTagPermissions) {
      throw new ConvexError("Invalid tag permissions");
    }

    // Calculate expected answer time
    const expectedAnswerTime = await calculateExpectedAnswerTime(
      ctx,
      orgId,
      args.tagIds,
      args.assigneeIds,
    );

    // Build participants list (creator + assignees + additional participants)
    const allParticipants = new Set([
      userId,
      ...args.assigneeIds,
      ...(args.participants || []),
    ]);

    // Create thread first
    const threadId = await ctx.db.insert("threads", {
      questionId: "", // Will be updated after question is created
      orgId,
      participants: Array.from(allParticipants),
      status: "active",
      updatedAt: Date.now(),
    });

    // Create question
    const questionId = await ctx.db.insert("questions", {
      title: args.title,
      content: args.content,
      contentPlaintext: args.contentPlaintext,
      createdBy: userId,
      participantIds: Array.from(allParticipants),
      assigneeIds: args.assigneeIds,
      orgId,
      tagIds: args.tagIds,
      status: "assigned", // Has assignees, so starts as assigned
      acceptedAnswers: [],
      expectedAnswerTime,
      isOverdue: false,
      unreadBy: Array.from(allParticipants).filter((id) => id !== userId),
      threadId: threadId,
      messageCount: 0,
      updatedAt: Date.now(),
    });

    // Update thread with question ID
    await ctx.db.patch(threadId, {
      questionId: questionId,
    });

    return questionId;
  },
});

// Update question participants
export const updateParticipants = mutation({
  args: {
    questionId: v.id("questions"),
    participants: v.array(v.string()),
    assigneeIds: v.array(v.string()),
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

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== orgId) {
      throw new ConvexError("Question not found");
    }

    // Check authorization (creator or current assignee)
    if (
      question.createdBy !== identity.subject &&
      !question.assigneeIds.includes(identity.subject)
    ) {
      throw new ConvexError("Not authorized to update participants");
    }

    // Validate inputs
    if (args.assigneeIds.length === 0) {
      throw new ConvexError("At least one assignee is required");
    }

    // Ensure creator is always a participant
    const newParticipants = question.createdBy
      ? Array.from(new Set([question.createdBy, ...args.participants]))
      : Array.from(new Set([...args.participants]));

    // Ensure all assignees are participants
    const finalParticipants = Array.from(
      new Set([...newParticipants, ...args.assigneeIds]),
    );

    // Update question
    await ctx.db.patch(args.questionId, {
      participantIds: finalParticipants,
      assigneeIds: args.assigneeIds,
      updatedAt: Date.now(),
      // Add new participants to unread list
      unreadBy: [
        ...question.unreadBy,
        ...finalParticipants.filter(
          (id) =>
            !question.participantIds.includes(id) && id !== identity.subject,
        ),
      ],
    });

    // Update thread participants
    await ctx.db.patch(question.threadId as Id<"threads">, {
      participants: finalParticipants,
      updatedAt: Date.now(),
    });

    return args.questionId;
  },
});

// Mark a message as accepted answer
export const markMessageAsAccepted = mutation({
  args: {
    questionId: v.id("questions"),
    messageId: v.id("messages"),
    isAccepted: v.boolean(),
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

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== orgId) {
      throw new ConvexError("Question not found");
    }

    // Check if user is an assignee
    if (!question.assigneeIds.includes(identity.subject)) {
      throw new ConvexError("Only assignees can mark answers as accepted");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.threadId !== question.threadId) {
      throw new ConvexError("Message not found or not in question thread");
    }

    // Update message
    await ctx.db.patch(args.messageId, {
      isAcceptedAnswer: args.isAccepted,
      acceptedBy: args.isAccepted ? identity.subject : undefined,
      acceptedAt: args.isAccepted ? Date.now() : undefined,
    });

    // Update question's accepted answers list
    let newAcceptedAnswers;
    if (args.isAccepted) {
      newAcceptedAnswers = [...question.acceptedAnswers, args.messageId];
    } else {
      newAcceptedAnswers = question.acceptedAnswers.filter(
        (id) => id !== args.messageId,
      );
    }

    // Determine new status
    const hasAnyAnswers = newAcceptedAnswers.length > 0;

    const newStatus = getStatusForQuestion(
      question.assigneeIds,
      hasAnyAnswers,
      question.status === "resolved",
    );

    await ctx.db.patch(args.questionId, {
      acceptedAnswers: newAcceptedAnswers,
      status: newStatus,
      answeredAt:
        hasAnyAnswers && !question.answeredAt
          ? Date.now()
          : question.answeredAt,
      updatedAt: Date.now(),
    });

    return args.questionId;
  },
});

// Resolve question
export const resolveQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUserWithGroups(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== orgId) {
      throw new ConvexError("Question not found");
    }

    // Check if user is an assignee
    if (!question.assigneeIds.includes(userId)) {
      throw new ConvexError("Only assignees can resolve questions");
    }

    await ctx.db.patch(args.questionId, {
      status: "resolved",
      updatedAt: Date.now(),
    });

    return args.questionId;
  },
});

// Mark question as read for current user
export const markQuestionAsRead = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== orgId) {
      throw new ConvexError("Question not found");
    }

    // Check if user is a participant
    if (!question.participantIds.includes(identity.subject)) {
      throw new ConvexError("Not authorized to view this question");
    }

    // Remove user from unread list
    await ctx.db.patch(args.questionId, {
      unreadBy: question.unreadBy.filter((id) => id !== identity.subject),
    });

    return args.questionId;
  },
});

// Mark questions as notified for current user
export const markAsNotified = mutation({
  args: { questionIds: v.array(v.id("questions")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const { orgId } = identity;
    if (!orgId || typeof orgId !== "string") {
      throw new ConvexError("Not in an organization");
    }

    const now = Date.now();
    for (const questionId of args.questionIds) {
      const question = await ctx.db.get(questionId);
      if (question && question.orgId === orgId) {
        await ctx.db.patch(questionId, { notifiedAt: now });
      }
    }

    return true;
  },
});

// Delete question (soft delete for now)
export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUserWithGroups(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== orgId) {
      throw new ConvexError("Question not found");
    }

    // Only creator can delete
    if (question.createdBy !== userId) {
      throw new ConvexError("Only the question creator can delete questions");
    }

    // Mark thread as archived instead of hard delete
    await ctx.db.patch(question.threadId as Id<"threads">, {
      status: "archived",
      updatedAt: Date.now(),
    });

    await ctx.db.delete(args.questionId);

    return true;
  },
});
