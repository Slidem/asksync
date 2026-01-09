import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

// Unified recalculation entry point for cronjob
// Triggers recalculation for both questions and email attention items
export const recalculateAllPendingItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Trigger both recalculations via scheduler (runs in parallel)
    await ctx.scheduler.runAfter(
      0,
      internal.questions.recalculation.recalculateAllPendingQuestions,
      {},
    );
    await ctx.scheduler.runAfter(
      0,
      internal.gmail.recalculation.recalculateAllPendingAttentionItems,
      {},
    );
  },
});
