import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx, internalMutation } from "../_generated/server";
import { calculateExpectedAnswerTime } from "../common/expectedTime";

// Helper function to recalculate a single attention item
async function recalculateSingleAttentionItem(
  ctx: MutationCtx,
  itemId: Id<"emailAttentionItems">,
) {
  const item = await ctx.db.get(itemId);
  if (!item) {
    return { updated: false, reason: "Item not found" };
  }

  // Skip if already resolved
  if (item.status === "resolved") {
    return { updated: false, reason: "Item already resolved" };
  }

  const now = Date.now();

  // Grace period logic (same as questions): if overdue < 24h, keep status
  if (item.isOverdue && item.expectedAnswerTime !== undefined) {
    const overdueMs = now - item.expectedAnswerTime;
    if (overdueMs < 24 * 60 * 60 * 1000) {
      return {
        updated: false,
        reason: "Grace period - overdue < 24h, keeping status",
      };
    }
  }

  // Recalculate expected answer time
  const newExpectedAnswerTime = await calculateExpectedAnswerTime(
    ctx,
    item.orgId,
    item.tagIds,
    [item.userId], // user as single "assignee"
    now,
  );

  const newIsOverdue = newExpectedAnswerTime < now;

  // Update item
  await ctx.db.patch(itemId, {
    expectedAnswerTime: newExpectedAnswerTime,
    isOverdue: newIsOverdue,
    updatedAt: now,
  });

  return {
    updated: true,
    oldExpectedTime: item.expectedAnswerTime,
    newExpectedTime: newExpectedAnswerTime,
    isOverdue: newIsOverdue,
  };
}

// Recalculate all pending attention items (for cronjob)
export const recalculateAllPendingAttentionItems = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (
    ctx,
    args,
  ): Promise<{
    updatedCount: number;
    skippedCount: number;
    hasMore: boolean;
  }> => {
    const BATCH_SIZE = 100;

    const result = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_user_and_status")
      .paginate({
        numItems: BATCH_SIZE,
        cursor: args.cursor || null,
      });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of result.page) {
      if (item.status === "pending") {
        const recalcResult = await recalculateSingleAttentionItem(
          ctx,
          item._id,
        );
        if (recalcResult.updated) {
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // Schedule next batch if there are more items
    if (!result.isDone && result.continueCursor) {
      await ctx.scheduler.runAfter(
        0,
        internal.gmail.recalculation.recalculateAllPendingAttentionItems,
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

// Recalculate attention items when tag config changes
export const recalculateAttentionItemsWithTags = internalMutation({
  args: { tagIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    // Query all pending attention items with any of these tags
    const items = await ctx.db.query("emailAttentionItems").collect();

    const affectedItems = items.filter(
      (i) =>
        i.status === "pending" &&
        i.tagIds.some((tagId) => args.tagIds.includes(tagId)),
    );

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of affectedItems) {
      const result = await recalculateSingleAttentionItem(ctx, item._id);
      if (result.updated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    return { updatedCount, skippedCount, total: affectedItems.length };
  },
});
