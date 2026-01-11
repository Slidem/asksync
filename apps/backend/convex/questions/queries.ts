/* eslint-disable import/order */
import { ConvexError, v } from "convex/values";

import { Id } from "../_generated/dataModel";
import { decorateResourceWithGrants } from "../permissions/common";
import { getUserWithGroups } from "../auth/user";
import { query } from "../_generated/server";

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
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const limit = args.limit || 50;

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

    // Apply cursor-based pagination
    let startIndex = 0;
    if (args.cursor) {
      const cursorIndex = filteredQuestions.findIndex(
        (q) => q._id === args.cursor,
      );
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedQuestions = filteredQuestions.slice(
      startIndex,
      startIndex + limit,
    );
    const hasMore = startIndex + limit < filteredQuestions.length;
    const nextCursor =
      hasMore && paginatedQuestions.length > 0
        ? paginatedQuestions[paginatedQuestions.length - 1]._id
        : undefined;

    // Fetch related data
    const questionsWithData = await Promise.all(
      paginatedQuestions.map(async (question) => {
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

        // Get thread
        const thread = await ctx.db.get(question.threadId as Id<"threads">);

        // Use stored messageCount (will be denormalized)
        const messageCount = question.messageCount || 0;

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

    return {
      questions: questionsWithData,
      nextCursor,
      hasMore,
    };
  },
});

// Get question stats for all tabs with filters applied
export const getQuestionStats = query({
  args: {
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
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    // Get all questions for the organization
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    // Apply filters to get base filtered set
    let filteredQuestions = allQuestions;

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

    // Calculate counts for each tab
    const assigned = filteredQuestions.filter((q) =>
      q.assigneeIds.includes(user.id),
    ).length;
    const created = filteredQuestions.filter(
      (q) => q.createdBy === user.id,
    ).length;
    const participating = filteredQuestions.filter((q) =>
      q.participantIds.includes(user.id),
    ).length;

    return {
      assigned,
      created,
      participating,
      total: filteredQuestions.length,
    };
  },
});

// Get urgent questions for dashboard
export const getUrgentQuestions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const limit = args.limit || 3;

    // Get all questions assigned to user that are not answered/resolved
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    const assignedQuestions = allQuestions.filter(
      (q) =>
        q.assigneeIds.includes(user.id) &&
        q.status !== "answered" &&
        q.status !== "resolved",
    );

    // Get current timeblock to check tag matching
    const currentTimeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", user.orgId).eq("createdBy", user.id),
      )
      .collect();

    const now = Date.now();
    const currentTimeblock = currentTimeblocks.find((tb) => {
      const startTime = tb.startTime;
      const endTime = tb.endTime;
      return startTime <= now && now <= endTime;
    });

    const currentTags = currentTimeblock?.tagIds || [];

    // Calculate urgency and match timeblock
    const questionsWithUrgency = assignedQuestions.map((q) => {
      const isOverdue = q.expectedAnswerTime < now;
      const matchesCurrentBlock = q.tagIds.some((tagId) =>
        currentTags.includes(tagId),
      );
      const urgencyScore = isOverdue ? 1000 : q.expectedAnswerTime - now;

      return {
        ...q,
        isOverdue,
        matchesCurrentBlock,
        urgencyScore,
      };
    });

    // Sort by urgency (overdue first, then by expected time)
    questionsWithUrgency.sort((a, b) => a.urgencyScore - b.urgencyScore);

    // Take top N
    const topQuestions = questionsWithUrgency.slice(0, limit);

    // Fetch related data
    const questionsWithData = await Promise.all(
      topQuestions.map(async (question) => {
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

        return {
          _id: question._id,
          _creationTime: question._creationTime,
          title: question.title,
          contentPlaintext: question.contentPlaintext,
          expectedAnswerTime: question.expectedAnswerTime,
          isOverdue: question.isOverdue,
          matchesCurrentBlock: question.matchesCurrentBlock,
          tags: tagsWithPermissions,
          threadId: question.threadId,
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

    // Get participant details
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

// Get count of unread questions for sidebar badge
export const getUnreadQuestionCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserWithGroups(ctx);

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    const unread = questions.filter(
      (q) =>
        q.unreadBy.includes(user.id) &&
        (q.assigneeIds.includes(user.id) || q.participantIds.includes(user.id)),
    ).length;

    return { unread };
  },
});
