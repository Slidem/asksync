import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getUser } from "../../auth/user";

// Get questions for timeblocks (supports multiple)
export const getTimeblockQuestions = query({
  args: {
    timeblockIds: v.optional(v.array(v.id("timeblocks"))),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    // Get timeblocks from args or find current ones
    let timeblocks: Array<{ tagIds: string[] }> = [];
    if (args.timeblockIds && args.timeblockIds.length > 0) {
      const fetched = await Promise.all(
        args.timeblockIds.map((id) => ctx.db.get(id)),
      );
      timeblocks = fetched.filter((tb) => tb !== null);
    } else {
      // Find current timeblocks
      const now = Date.now();
      const allTimeblocks = await ctx.db
        .query("timeblocks")
        .withIndex("by_org_and_creator", (q) =>
          q.eq("orgId", user.orgId).eq("createdBy", user.id),
        )
        .collect();

      timeblocks = allTimeblocks.filter(
        (tb) => tb.startTime <= now && tb.endTime >= now,
      );
    }

    if (timeblocks.length === 0) return [];

    // Collect all unique tagIds from all timeblocks
    const allTagIds = new Set<string>();
    for (const tb of timeblocks) {
      for (const tagId of tb.tagIds) {
        allTagIds.add(tagId);
      }
    }

    // Get all questions assigned to user
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    // Filter: assigned to user + matching ANY timeblock tag + not answered
    const questions = allQuestions.filter((q) => {
      const isAssigned = q.assigneeIds.includes(user.id);
      const hasMatchingTag = q.tagIds.some((tagId) => allTagIds.has(tagId));
      const notAnswered = q.status !== "answered" && q.status !== "resolved";

      return isAssigned && hasMatchingTag && notAnswered;
    });

    // Sort by urgency (closest expectedAnswerTime = most urgent)
    const now = Date.now();
    questions.sort((a, b) => {
      // Overdue first
      const aOverdue = a.expectedAnswerTime < now;
      const bOverdue = b.expectedAnswerTime < now;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then by closest to now
      return (
        Math.abs(a.expectedAnswerTime - now) -
        Math.abs(b.expectedAnswerTime - now)
      );
    });

    // Get tags for each question
    const questionsWithData = await Promise.all(
      questions.map(async (question) => {
        const tags = await Promise.all(
          question.tagIds.map((tagId: string) =>
            ctx.db.get(tagId as Id<"tags">),
          ),
        );

        const filteredTags = tags.filter((tag) => tag !== null);

        return {
          ...question,
          tags: filteredTags,
          isOverdue: question.expectedAnswerTime < now,
        };
      }),
    );

    return questionsWithData;
  },
});
