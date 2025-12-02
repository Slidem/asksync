import { Id } from "../_generated/dataModel";
import { hasPermission } from "../permissions/common";
import { expandRecurringTimeblocks } from "../timeblocks/helpers";

// Helper function to calculate expected answer time from tags
export async function calculateExpectedAnswerTime(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  tagIds: string[],
  assigneeIds: string[],
  currentTime: number = Date.now(),
): Promise<number> {
  const tags = await Promise.all(
    tagIds.map((tagId) => ctx.db.get(tagId as Id<"tags">)),
  );

  let shortestResponseTime = Infinity;

  for (const tag of tags) {
    if (!tag) continue;

    if (tag.answerMode === "on-demand" && tag.responseTimeMinutes) {
      // On-demand: immediate response based on configured time
      shortestResponseTime = Math.min(
        shortestResponseTime,
        tag.responseTimeMinutes,
      );
    } else if (tag.answerMode === "scheduled") {
      // Scheduled: find next available timeblock from any assignee
      const minutesUntilNextTimeblock = await findNextAvailableTimeblock(
        ctx,
        tag._id,
        assigneeIds,
        currentTime,
      );

      if (minutesUntilNextTimeblock !== null) {
        shortestResponseTime = Math.min(
          shortestResponseTime,
          minutesUntilNextTimeblock,
        );
      } else {
        // No timeblocks found, default to 24 hours
        shortestResponseTime = Math.min(shortestResponseTime, 24 * 60);
      }
    }
  }

  if (shortestResponseTime === Infinity) {
    // Default to 24 hours if no tags have response times
    shortestResponseTime = 24 * 60;
  }

  return currentTime + shortestResponseTime * 60 * 1000;
}

// Helper to find next available timeblock for a tag across all assignees
async function findNextAvailableTimeblock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  tagId: string,
  assigneeIds: string[],
  currentTime: number,
): Promise<number | null> {
  const lookAheadDays = 30;
  const endDate = currentTime + lookAheadDays * 24 * 60 * 60 * 1000;

  let earliestTimeblock: number | null = null;

  // Check timeblocks for each assignee
  for (const assigneeId of assigneeIds) {
    // Query timeblocks created by this assignee
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => q.eq(q.field("createdBy"), assigneeId))
      .collect();

    // Filter timeblocks that handle this tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relevantTimeblocks = timeblocks.filter((tb: any) =>
      tb.tagIds.includes(tagId),
    );

    if (relevantTimeblocks.length === 0) continue;

    // Expand recurring timeblocks
    const expandedTimeblocks = expandRecurringTimeblocks(
      relevantTimeblocks,
      currentTime,
      endDate,
    );

    // Find earliest timeblock after current time
    const nextTimeblock = expandedTimeblocks
      .filter((tb) => tb.startTime > currentTime)
      .sort((a, b) => a.startTime - b.startTime)[0];

    if (nextTimeblock) {
      const minutesUntilTimeblock =
        (nextTimeblock.startTime - currentTime) / (60 * 1000);

      if (
        earliestTimeblock === null ||
        minutesUntilTimeblock < earliestTimeblock
      ) {
        earliestTimeblock = minutesUntilTimeblock;
      }
    }
  }

  return earliestTimeblock;
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
