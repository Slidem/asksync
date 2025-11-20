/* eslint-disable import/order */
import { ConvexError, v } from "convex/values";
import {
  decorateResourceWithGrants,
  hasPermission,
} from "./permissions/common";
import { mutation, query } from "./_generated/server";

import { Id } from "./_generated/dataModel";
import { getUserWithGroups } from "./auth/user";

// Helper function to calculate expected answer time from tags
async function calculateExpectedAnswerTime(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  tagIds: string[],
): Promise<number> {
  const tags = await Promise.all(
    tagIds.map((tagId) => ctx.db.get(tagId as Id<"tags">)),
  );

  let shortestResponseTime = Infinity;

  for (const tag of tags) {
    if (!tag) continue;

    if (tag.answerMode === "on-demand" && tag.responseTimeMinutes) {
      shortestResponseTime = Math.min(
        shortestResponseTime,
        tag.responseTimeMinutes,
      );
    } else if (tag.answerMode === "scheduled") {
      // For scheduled tags, default to 24 hours
      shortestResponseTime = Math.min(shortestResponseTime, 24 * 60);
    }
  }

  if (shortestResponseTime === Infinity) {
    // Default to 24 hours if no tags have response times
    shortestResponseTime = 24 * 60;
  }

  return Date.now() + shortestResponseTime * 60 * 1000;
}

// Helper function to validate user has permissions for tags
async function validateTagPermissions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  orgId: string,
  userId: string,
  tagIds: string[],
): Promise<boolean> {
  for (const tagId of tagIds) {
    const tag = await ctx.db.get(tagId as Id<"tags">);
    if (!tag || tag.orgId !== orgId) {
      return false;
    }

    // Check if user has access to tag via permissions
    const hasAccess = await hasPermission(ctx, "tags", tagId, "view");
    if (tag.createdBy !== userId && !hasAccess) {
      return false;
    }
  }
  return true;
}

// Helper function to auto-transition question status
function getStatusForQuestion(
  assigneeIds: string[],
  hasAnswers: boolean,
  isResolved: boolean,
): "pending" | "assigned" | "in_progress" | "answered" | "resolved" {
  if (isResolved) return "resolved";
  if (hasAnswers) return "answered";
  if (assigneeIds.length > 0) return "assigned";
  return "pending";
}

// Create a new question with thread
export const createQuestion = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tagIds: v.array(v.string()),
    assigneeIds: v.array(v.string()),
    participants: v.optional(v.array(v.string())),
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
      identity.subject,
      args.tagIds,
    );

    if (!hasTagPermissions) {
      throw new ConvexError("Invalid tag permissions");
    }

    // Calculate expected answer time
    const expectedAnswerTime = await calculateExpectedAnswerTime(
      ctx,
      args.tagIds,
    );

    // Build participants list (creator + assignees + additional participants)
    const allParticipants = new Set([
      identity.subject,
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
      createdBy: identity.subject,
      participantIds: Array.from(allParticipants),
      assigneeIds: args.assigneeIds,
      orgId,
      tagIds: args.tagIds,
      status: "assigned", // Has assignees, so starts as assigned
      acceptedAnswers: [],
      expectedAnswerTime,
      isOverdue: false,
      unreadBy: Array.from(allParticipants).filter(
        (id) => id !== identity.subject,
      ),
      threadId: threadId,
      updatedAt: Date.now(),
    });

    // Update thread with question ID
    await ctx.db.patch(threadId, {
      questionId: questionId,
    });

    return questionId;
  },
});

// Get questions for a specific user (for tabs: created/assigned/participating)
export const listQuestionsByUser = query({
  args: {
    filter: v.union(
      v.literal("created"),
      v.literal("assigned"),
      v.literal("participating"),
    ),
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("unanswered"),
        v.literal("ongoing"),
        v.literal("answered"),
        v.literal("all"),
      ),
    ),
    tagIds: v.optional(v.array(v.string())),
    sortBy: v.optional(
      v.union(
        v.literal("expectedTime"),
        v.literal("createdAt"),
        v.literal("updatedAt"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    // Get all questions for the organization first
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    // Filter questions based on filter type in memory
    let questions: typeof allQuestions;
    switch (args.filter) {
      case "created":
        questions = allQuestions.filter((q) => q.createdBy === user.id);
        break;
      case "assigned":
        questions = allQuestions.filter((q) => q.assigneeIds.includes(user.id));
        break;
      case "participating":
        questions = allQuestions.filter((q) =>
          q.participantIds.includes(user.id),
        );
        break;
      default:
        questions = [];
    }

    // Apply filters
    let filteredQuestions = questions;

    // Search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(searchLower) ||
          q.content.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (args.status && args.status !== "all") {
      switch (args.status) {
        case "unanswered":
          filteredQuestions = filteredQuestions.filter(
            (q) => q.status === "pending" || q.status === "assigned",
          );
          break;
        case "ongoing":
          filteredQuestions = filteredQuestions.filter(
            (q) => q.status === "in_progress",
          );
          break;
        case "answered":
          filteredQuestions = filteredQuestions.filter(
            (q) => q.status === "answered" || q.status === "resolved",
          );
          break;
      }
    }

    // Tag filter
    if (args.tagIds && args.tagIds.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) =>
        args.tagIds!.some((tagId) => q.tagIds.includes(tagId)),
      );
    }

    // Calculate overdue status dynamically
    const now = Date.now();
    filteredQuestions.forEach((question) => {
      question.isOverdue = question.expectedAnswerTime < now;
    });

    // Sort questions
    const sortBy = args.sortBy || "expectedTime";
    filteredQuestions.sort((a, b) => {
      switch (sortBy) {
        case "expectedTime":
          // Overdue first, then by expected time
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          return a.expectedAnswerTime - b.expectedAnswerTime;
        case "createdAt":
          return b._creationTime - a._creationTime;
        case "updatedAt":
          return b.updatedAt - a.updatedAt;
        default:
          return 0;
      }
    });

    // Fetch related data
    const questionsWithData = await Promise.all(
      filteredQuestions.map(async (question) => {
        // Get tags
        const tags = await Promise.all(
          question.tagIds.map((tagId: string) =>
            ctx.db.get(tagId as Id<"tags">),
          ),
        );

        const filteredTags = tags.filter((tag) => tag !== null);

        const tagsWithPermissions = await decorateResourceWithGrants({
          ctx,
          currentUser: user,
          resourceType: "tags",
          resources: filteredTags,
        });

        // Get thread and message count
        const thread = await ctx.db.get(question.threadId as Id<"threads">);
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("by_thread", (q) => q.eq("threadId", question.threadId))
          .collect()
          .then((messages) => messages.filter((m) => !m.isDeleted).length);

        // Check for unread messages
        const hasUnread = question.unreadBy.includes(user.id);

        return {
          ...question,
          tags: tagsWithPermissions,
          thread,
          messageCount,
          hasUnread,
        };
      }),
    );

    return questionsWithData;
  },
});

// Get a specific question by ID with full details
export const getQuestionById = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question || question.orgId !== user.orgId) {
      throw new ConvexError("Question not found");
    }

    // Check if user is a participant
    if (!question.participantIds.includes(user.id)) {
      throw new ConvexError("Not authorized to view this question");
    }

    // Note: Mark as read functionality should be implemented as a separate mutation
    // For now, we'll skip the mark-as-read update in the query

    // Get related data
    const tags = await Promise.all(
      question.tagIds.map((tagId: string) => ctx.db.get(tagId as Id<"tags">)),
    );

    const filteredTags = tags.filter((tag) => tag !== null);

    const tagsWithPermissions = await decorateResourceWithGrants({
      ctx,
      currentUser: user,
      resourceType: "tags",
      resources: filteredTags,
    });

    const thread = await ctx.db.get(question.threadId as Id<"threads">);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", question.threadId))
      .collect();

    // Get participant details (you'd typically have a users table for this)
    // For now, we'll just return the IDs
    const participants = question.participantIds.map((userId) => ({
      id: userId,
      isAssignee: question.assigneeIds.includes(userId),
      isCreator: question.createdBy === userId,
    }));

    return {
      ...question,
      tags: tagsWithPermissions,
      thread,
      messages: messages.filter((m) => !m.isDeleted),
      participants,
    };
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
    const hasAnyAnswers =
      newAcceptedAnswers.length > 0 || question.manualAnswer !== undefined;

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

// Add manual answer to question
export const addManualAnswer = mutation({
  args: {
    questionId: v.id("questions"),
    answer: v.string(),
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
      throw new ConvexError("Only assignees can add manual answers");
    }

    const hasAnyAnswers =
      question.acceptedAnswers.length > 0 || args.answer.trim() !== "";

    const newStatus = getStatusForQuestion(
      question.assigneeIds,
      hasAnyAnswers,
      question.status === "resolved",
    );

    await ctx.db.patch(args.questionId, {
      manualAnswer: args.answer,
      manualAnswerBy: identity.subject,
      manualAnswerAt: Date.now(),
      status: newStatus,
      answeredAt: !question.answeredAt ? Date.now() : question.answeredAt,
      updatedAt: Date.now(),
    });

    return args.questionId;
  },
});

// Resolve question
export const resolveQuestion = mutation({
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

    // Check if user is an assignee
    if (!question.assigneeIds.includes(identity.subject)) {
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

// Delete question (soft delete for now)
export const deleteQuestion = mutation({
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

    // Only creator can delete
    if (question.createdBy !== identity.subject) {
      throw new ConvexError("Only the question creator can delete questions");
    }

    // For now, just mark thread as archived instead of hard delete
    await ctx.db.patch(question.threadId as Id<"threads">, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // Could add a "deleted" field to questions table instead of hard delete
    await ctx.db.delete(args.questionId);

    return true;
  },
});
