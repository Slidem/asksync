import { Doc } from "../_generated/dataModel";
import { PatchValue } from "../common/types";

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

export function expandRecurringTimeblocks(
  timeblocks: Doc<"timeblocks">[],
  startDate: number,
  endDate: number,
): ExpandedTimeblock[] {
  const expanded: ExpandedTimeblock[] = [];

  for (const timeblock of timeblocks) {
    if (!timeblock.recurrenceRule) {
      // Non-recurring timeblock
      if (timeblock.startTime >= startDate && timeblock.startTime < endDate) {
        expanded.push({
          timeblockId: timeblock._id,
          title: timeblock.title,
          description: timeblock.description,
          location: timeblock.location,
          startTime: timeblock.startTime,
          endTime: timeblock.endTime,
          timezone: timeblock.timezone,
          tagIds: timeblock.tagIds,
          color: timeblock.color,
          isRecurring: false,
        });
      }
    } else {
      // Recurring timeblock
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

function generateRecurringInstances(
  timeblock: Doc<"timeblocks">,
  startDate: number,
  endDate: number,
): ExpandedTimeblock[] {
  const instances: ExpandedTimeblock[] = [];
  const exceptionDates = new Set(timeblock.exceptionDates || []);
  const duration = timeblock.endTime - timeblock.startTime;

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
          timeblockId: timeblock._id,
          title: timeblock.title,
          description: timeblock.description,
          location: timeblock.location,
          startTime: instanceStart,
          endTime: instanceEnd,
          timezone: timeblock.timezone,
          tagIds: timeblock.tagIds,
          color: timeblock.color,
          isRecurring: true,
        });
      }
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return instances;
}

export function filterByAnyTag(
  expandedTimeblocks: ExpandedTimeblock[],
  tagIds: string[],
): ExpandedTimeblock[] {
  if (tagIds.length === 0) {
    return expandedTimeblocks;
  }

  return expandedTimeblocks.filter((timeblock) =>
    timeblock.tagIds.some((tagId) => tagIds.includes(tagId)),
  );
}

export function sortByStartTime(
  expandedTimeblocks: ExpandedTimeblock[],
): ExpandedTimeblock[] {
  return [...expandedTimeblocks].sort((a, b) => a.startTime - b.startTime);
}
