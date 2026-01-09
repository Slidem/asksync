import { Doc, Id } from "../_generated/dataModel";
import {
  expandRecurringTimeblocks,
  getTimeblocksForUser,
} from "../timeblocks/helpers";

// Shared helper to calculate expected answer time from tags
// Works for both questions (multiple assigneeIds) and emails (single userId)
export async function calculateExpectedAnswerTime(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  orgId: string,
  tagIds: string[],
  userIds: string[], // for emails: [userId], for questions: assigneeIds
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
      // Scheduled: find next available timeblock from any user
      const minutesUntilNextTimeblock = await findNextAvailableTimeblock(
        ctx,
        orgId,
        tag._id,
        userIds,
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

// Helper to find next available timeblock for a tag across all users
async function findNextAvailableTimeblock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  orgId: string,
  tagId: string,
  userIds: string[],
  currentTime: number,
): Promise<number | null> {
  const lookAheadDays = 30;
  const endDate = currentTime + lookAheadDays * 24 * 60 * 60 * 1000;
  let earliestTimeblock: number | null = null;

  for (const userId of userIds) {
    const timeBlocks: Doc<"timeblocks">[] = [];

    const currentAvailableTimeblocks = await getTimeblocksForUser({
      ctx,
      orgId,
      retrievalMode: "all",
      forUserId: userId,
      currentUser: ctx.user,
      currentDate: currentTime,
    });

    if (currentAvailableTimeblocks.length > 0) {
      timeBlocks.push(...currentAvailableTimeblocks);
    } else {
      const futureTimeblocks = await getTimeblocksForUser({
        ctx,
        orgId,
        retrievalMode: "all",
        forUserId: userId,
        currentUser: ctx.user,
        range: { start: currentTime, end: endDate },
      });
      timeBlocks.push(...futureTimeblocks);
    }

    const timeBlocksWithTag = timeBlocks.filter((tb) =>
      tb.tagIds.includes(tagId),
    );

    const expandedTimeblocks = await expandRecurringTimeblocks(
      timeBlocksWithTag,
      currentTime,
      endDate,
    );

    // Find earliest timeblock after current time
    const nextTimeblock = expandedTimeblocks
      .filter((tb) => tb.startTime > currentTime || tb.endTime > currentTime)
      .sort((a, b) => a.startTime - b.startTime)[0];

    if (nextTimeblock) {
      let minutesUntilTimeblock =
        (nextTimeblock.startTime - currentTime) / (60 * 1000);

      if (nextTimeblock.startTime <= currentTime) {
        minutesUntilTimeblock =
          (nextTimeblock.endTime - currentTime) / (60 * 1000);
      }

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
