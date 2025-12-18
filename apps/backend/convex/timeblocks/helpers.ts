import { IndexRange } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { PatchValue, UserWithGroups } from "../common/types";
import {
  decorateResourceWithGrants,
  getPermittedResourcesForType,
} from "../permissions/common";

export function addOptionalValue<K extends keyof Doc<"timeblocks">>(
  obj: PatchValue<Doc<"timeblocks">>,
  key: K,
  value: Doc<"timeblocks">[K] | undefined,
) {
  if (value !== undefined) {
    obj[key] = value;
  }
}

export function validateTimeRange(startTime: number, endTime: number) {
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
}

export function validateRecurringTimeblock(
  timeblock: Doc<"timeblocks">,
): asserts timeblock is Doc<"timeblocks"> & { recurrenceRule: string } {
  if (!timeblock.recurrenceRule) {
    throw new Error("Operation only valid for recurring timeblocks");
  }
}

export interface ExpandedTimeblock {
  timeblockId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  endTime: number;
  timezone: string;
  tagIds: string[];
  color?: string;
  isRecurring: boolean;
}

export function expandRecurringTimeblocks<T extends Doc<"timeblocks">>(
  timeblocks: T[],
  startDate: number,
  endDate: number,
): T[] {
  const expanded: T[] = [];

  for (const timeblock of timeblocks) {
    if (!timeblock.recurrenceRule) {
      expanded.push(timeblock);
    } else {
      const instances = generateRecurringInstances(
        timeblock,
        startDate,
        endDate,
      );
      expanded.push(...instances);
    }
  }

  return expanded;
}

function generateRecurringInstances<T extends Doc<"timeblocks">>(
  timeblock: T,
  startDate: number,
  endDate: number,
): T[] {
  const instances: T[] = [];
  const exceptionDates = new Set(timeblock.exceptionDates || []);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const originalDate = new Date(timeblock.startTime);
  const dayOfWeek = originalDate.getUTCDay();

  const currentDate = new Date(startDate);
  currentDate.setUTCHours(
    originalDate.getUTCHours(),
    originalDate.getUTCMinutes(),
    originalDate.getUTCSeconds(),
    originalDate.getUTCMilliseconds(),
  );

  while (currentDate.getTime() < endDate) {
    const instanceStart = currentDate.getTime();
    const duration = timeblock.endTime - timeblock.startTime;
    const instanceEnd = instanceStart + duration;

    // Check if this date is excluded
    const midnightTimestamp = new Date(currentDate).setUTCHours(0, 0, 0, 0);
    if (!exceptionDates.has(midnightTimestamp)) {
      // Check if instance matches recurrence rule
      let shouldInclude = false;

      if (timeblock.recurrenceRule === "FREQ=DAILY") {
        shouldInclude = true;
      } else if (timeblock.recurrenceRule === "FREQ=WEEKLY") {
        shouldInclude = currentDate.getUTCDay() === dayOfWeek;
      } else if (
        timeblock.recurrenceRule === "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
      ) {
        const day = currentDate.getUTCDay();
        shouldInclude = day >= 1 && day <= 5; // Monday to Friday
      }

      if (shouldInclude && instanceStart >= startDate) {
        instances.push({
          ...timeblock,
          startTime: instanceStart,
          endTime: instanceEnd,
        });
      }
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return instances;
}

export function filterByAnyTag(
  expandedTimeblocks: Doc<"timeblocks">[],
  tagIds: string[],
): Doc<"timeblocks">[] {
  if (tagIds.length === 0) {
    return expandedTimeblocks;
  }

  return expandedTimeblocks.filter((timeblock) =>
    timeblock.tagIds.some((tagId) => tagIds.includes(tagId)),
  );
}

export function sortByStartTime(
  expandedTimeblocks: Doc<"timeblocks">[],
): Doc<"timeblocks">[] {
  return [...expandedTimeblocks].sort((a, b) => a.startTime - b.startTime);
}

export function doesRecurringTimeblockMatchDate(
  timeblock: Doc<"timeblocks">,
  currentDate: number,
): boolean {
  if (!timeblock.recurrenceRule) return false;

  // Check exception dates
  const exceptionDates = new Set(timeblock.exceptionDates || []);
  const midnightTimestamp = new Date(currentDate).setUTCHours(0, 0, 0, 0);
  if (exceptionDates.has(midnightTimestamp)) return false;

  // Extract time-of-day from template timeblock
  const templateStart = new Date(timeblock.startTime);
  const templateEnd = new Date(timeblock.endTime);
  const templateStartMinutes =
    templateStart.getUTCHours() * 60 + templateStart.getUTCMinutes();
  const templateEndMinutes =
    templateEnd.getUTCHours() * 60 + templateEnd.getUTCMinutes();

  // Extract time-of-day from current date
  const current = new Date(currentDate);
  const currentMinutes = current.getUTCHours() * 60 + current.getUTCMinutes();

  // Check if time is within bounds
  const isTimeInBounds =
    currentMinutes >= templateStartMinutes &&
    currentMinutes <= templateEndMinutes;

  if (!isTimeInBounds) return false;

  // Check recurrence pattern
  if (timeblock.recurrenceRule === "FREQ=DAILY") {
    return true;
  }

  const currentWeekday = current.getUTCDay();

  if (timeblock.recurrenceRule === "FREQ=WEEKLY") {
    const templateWeekday = templateStart.getUTCDay();
    return currentWeekday === templateWeekday;
  }

  if (timeblock.recurrenceRule === "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR") {
    return currentWeekday >= 1 && currentWeekday <= 5;
  }

  return false;
}

export function doesRecurringTimeblockMatchRange(
  timeblock: Doc<"timeblocks">,
  range: { start: number; end: number },
): boolean {
  if (!timeblock.recurrenceRule) return false;

  // DAILY always matches any range
  if (timeblock.recurrenceRule === "FREQ=DAILY") {
    return true;
  }

  const templateStart = new Date(timeblock.startTime);
  const templateWeekday = templateStart.getUTCDay();

  // Check if the recurring weekday occurs within the date range
  const rangeStart = new Date(range.start);
  const rangeEnd = new Date(range.end);

  // Iterate through days in range to see if any match
  const currentDay = new Date(rangeStart);
  currentDay.setUTCHours(0, 0, 0, 0);

  while (currentDay <= rangeEnd) {
    const dayWeekday = currentDay.getUTCDay();

    // Check exception dates
    const exceptionDates = new Set(timeblock.exceptionDates || []);
    const midnightTimestamp = currentDay.getTime();

    if (!exceptionDates.has(midnightTimestamp)) {
      if (timeblock.recurrenceRule === "FREQ=WEEKLY") {
        if (dayWeekday === templateWeekday) return true;
      } else if (
        timeblock.recurrenceRule === "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
      ) {
        if (dayWeekday >= 1 && dayWeekday <= 5) return true;
      }
    }

    currentDay.setUTCDate(currentDay.getUTCDate() + 1);
  }

  return false;
}

export async function getTimeblocksForUser({
  ctx,
  orgId,
  isInAuthContext = true,
  forUserId,
  currentUser,
  currentDate,
  range,
}: {
  ctx: BaseQueryCtx;
  isInAuthContext?: boolean;
  orgId: string;
  forUserId: string;
  currentUser: UserWithGroups;
  range?: { start: number; end: number };
  currentDate?: number;
}) {
  if (!range && !currentDate) {
    throw new Error("Either range or currentDate must be provided");
  }

  if (range && currentDate) {
    throw new Error("Cannot provide both range and currentDate");
  }

  const filterNonRecurringTimeblocks = (timeblock: Doc<"timeblocks">) => {
    if (timeblock.recurrenceRule) {
      return false;
    }

    if (currentDate) {
      return (
        timeblock.startTime <= currentDate && timeblock.endTime >= currentDate
      );
    }

    return true;
  };

  const nonRecurringTimeblocks = (
    await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator_and_startTime_and_endTime", (q) => {
        const query = q.eq("orgId", orgId).eq("createdBy", forUserId);
        let indexRange: IndexRange | null = null;

        if (range) {
          indexRange = query
            .gte("startTime", range.start)
            .lte("startTime", range.end);
        } else if (currentDate) {
          const start = getStartOfDayTimestamp(currentDate);
          const end = getEndOfDayTimestamp(currentDate);
          indexRange = query.gte("startTime", start).lte("startTime", end);
        }

        return indexRange!;
      })
      .collect()
  ).filter(filterNonRecurringTimeblocks);

  const recurringTimeblocks = (
    await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", orgId).eq("createdBy", forUserId),
      )
      .collect()
  ).filter((tb) => {
    if (!tb.recurrenceRule) return false;

    if (currentDate) {
      return doesRecurringTimeblockMatchDate(tb, currentDate);
    }

    if (range) {
      return doesRecurringTimeblockMatchRange(tb, range);
    }

    return false;
  });

  const allTimeblocks = [...nonRecurringTimeblocks, ...recurringTimeblocks];

  if (isInAuthContext) {
    const filteredTimeblocks = await filterPermittedResources(
      allTimeblocks,
      ctx,
    );

    return await decorateResourceWithGrants({
      ctx,
      currentUser,
      resourceType: "timeblocks",
      resources: filteredTimeblocks,
    });
  }

  return allTimeblocks;
}

export function getStartOfDayTimestamp(epochMillis: number): number {
  const startOfDay = new Date(epochMillis);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay.getTime();
}

export function getEndOfDayTimestamp(epochMillis: number): number {
  const endOfDay = new Date(epochMillis);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

export async function filterPermittedResources(
  timeblocks: Doc<"timeblocks">[],
  ctx: BaseQueryCtx,
): Promise<Doc<"timeblocks">[]> {
  const accessibleTimeblockIds = await getPermittedResourcesForType(
    ctx,
    "timeblocks",
    "view",
  );

  return timeblocks.filter((tb) => accessibleTimeblockIds.includes(tb._id));
}
