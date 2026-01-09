import { Id } from "../_generated/dataModel";
import { hasPermission } from "../permissions/common";

// Re-export from common for backwards compatibility
export { calculateExpectedAnswerTime } from "../common/expectedTime";

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
