import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx, internalMutation } from "../_generated/server";
import { calculateExpectedAnswerTime } from "./helpers";

// Helper function to recalculate a single question
async function recalculateSingleQuestion(
  ctx: MutationCtx,
  questionId: Id<"questions">,
) {
  const question = await ctx.db.get(questionId);
  if (!question) {
    return { updated: false, reason: "Question not found" };
  }

  // Skip if question is answered or resolved
  if (question.status === "answered" || question.status === "resolved") {
    return { updated: false, reason: "Question already answered/resolved" };
  }

  const now = Date.now();

  // Grace period logic: if overdue < 1 day, keep showing overdue status
  if (question.isOverdue) {
    const overdueMs = now - question.expectedAnswerTime;
    if (overdueMs < 24 * 60 * 60 * 1000) {
      return {
        updated: false,
        reason: "Grace period - overdue < 1 day, keeping status",
      };
    }
  }

  // Recalculate expected answer time
  const newExpectedAnswerTime = await calculateExpectedAnswerTime(
    ctx,
    question.tagIds,
    question.assigneeIds,
    now,
  );

  const newIsOverdue = newExpectedAnswerTime < now;

  // Update question
  await ctx.db.patch(questionId, {
    expectedAnswerTime: newExpectedAnswerTime,
    isOverdue: newIsOverdue,
    updatedAt: now,
  });

  return {
    updated: true,
    oldExpectedTime: question.expectedAnswerTime,
    newExpectedTime: newExpectedAnswerTime,
    isOverdue: newIsOverdue,
  };
}

// Recalculate expected answer time for a single question
export const recalculateQuestionExpectedTime = internalMutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await recalculateSingleQuestion(ctx, args.questionId);
  },
});

// Helper function to recalculate bulk questions
async function recalculateBulkQuestionsHelper(
  ctx: MutationCtx,
  questionIds: Id<"questions">[],
) {
  let updatedCount = 0;
  let skippedCount = 0;

  for (const questionId of questionIds) {
    const result = await recalculateSingleQuestion(ctx, questionId);
    if (result.updated) {
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  return { updatedCount, skippedCount, total: questionIds.length };
}

// Recalculate expected answer time for multiple questions (batch)
export const recalculateBulkQuestions = internalMutation({
  args: { questionIds: v.array(v.id("questions")) },
  handler: async (ctx, args) => {
    return await recalculateBulkQuestionsHelper(ctx, args.questionIds);
  },
});

// Recalculate all pending/assigned questions (cron job)
export const recalculateAllPendingQuestions = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const BATCH_SIZE = 100;

    // Query pending and assigned questions
    const result = await ctx.db
      .query("questions")
      .withIndex("by_org_and_status")
      .paginate({
        numItems: BATCH_SIZE,
        cursor: args.cursor || null,
      });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const question of result.page) {
      // Only process pending/assigned questions
      if (question.status === "pending" || question.status === "assigned") {
        const recalcResult = await recalculateSingleQuestion(ctx, question._id);
        if (recalcResult.updated) {
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // Schedule next batch if there are more questions
    if (result.continueCursor) {
      await ctx.scheduler.runAfter(
        0,
        internal.questions.recalculation.recalculateAllPendingQuestions,
        { cursor: result.continueCursor },
      );
    }

    return {
      updatedCount,
      skippedCount,
      hasMore: !!result.continueCursor,
    };
  },
});

// Query questions affected by tag changes
export const recalculateQuestionsWithTag = internalMutation({
  args: { tagId: v.string() },
  handler: async (ctx, args) => {
    // Query all pending/assigned questions with this tag
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_org_and_status")
      .collect();

    const affectedQuestions = questions.filter(
      (q) =>
        q.tagIds.includes(args.tagId) &&
        (q.status === "pending" || q.status === "assigned"),
    );

    const questionIds = affectedQuestions.map((q) => q._id);

    if (questionIds.length === 0) {
      return { updatedCount: 0, skippedCount: 0, total: 0 };
    }

    return await recalculateBulkQuestionsHelper(ctx, questionIds);
  },
});

// Query questions affected by timeblock changes
export const recalculateQuestionsWithTags = internalMutation({
  args: { tagIds: v.array(v.string()), assigneeId: v.string() },
  handler: async (ctx, args) => {
    // Query all pending/assigned questions with matching tags and assignee
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_org_and_status")
      .collect();

    const affectedQuestions = questions.filter(
      (q) =>
        (q.status === "pending" || q.status === "assigned") &&
        q.assigneeIds.includes(args.assigneeId) &&
        q.tagIds.some((tagId) => args.tagIds.includes(tagId)),
    );

    const questionIds = affectedQuestions.map((q) => q._id);

    if (questionIds.length === 0) {
      return { updatedCount: 0, skippedCount: 0, total: 0 };
    }

    return await recalculateBulkQuestionsHelper(ctx, questionIds);
  },
});
