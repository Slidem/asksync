import { Id } from "../_generated/dataModel";
import { hasPermission } from "../permissions/common";

// Helper function to calculate expected answer time from tags
export async function calculateExpectedAnswerTime(
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
export async function validateTagPermissions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  orgId: string,
  userId: string,
  tagIds: Id<"tags">[],
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
export function getStatusForQuestion(
  assigneeIds: string[],
  hasAnswers: boolean,
  isResolved: boolean,
): "pending" | "assigned" | "in_progress" | "answered" | "resolved" {
  if (isResolved) return "resolved";
  if (hasAnswers) return "answered";
  if (assigneeIds.length > 0) return "assigned";
  return "pending";
}
