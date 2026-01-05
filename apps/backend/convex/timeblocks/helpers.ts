import { IndexRange } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { PatchValue, UserWithGroups } from "../common/types";
import {
  DecoratedResource,
  decorateResourceWithGrants,
  getPermissionLevelFromGrants,
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

/**
 * Retrieval mode for getTimeblocksForUser:
 * - "all": Return all timeblocks without filtering (for internal/system use)
 * - "filter_not_allowed": Filter out timeblocks user can't view (for auth contexts)
 * - "hide_not_allowed_details": Return all, mask non-permitted as "busy" blocks
 */
export type RetrievalMode =
  | "all"
  | "filter_not_allowed"
  | "hide_not_allowed_details";

type GetTimeblocksParams = {
  ctx: BaseQueryCtx;
  orgId: string;
  forUserId: string;
  currentUser: UserWithGroups;
  range?: { start: number; end: number };
  currentDate?: number;
};

/** Minimal "busy" block returned when user lacks view permission */
export type BusyTimeblock = {
  _id: Doc<"timeblocks">["_id"];
  _creationTime: number;
  startTime: number;
  endTime: number;
  timezone: string;
  orgId: string;
  createdBy: string;
  source: Doc<"timeblocks">["source"];
  recurrenceRule?: Doc<"timeblocks">["recurrenceRule"];
  exceptionDates?: number[];
  updatedAt: number;
  isBusy: true;
  // Empty/masked fields
  title: "";
  tagIds: [];
  permissions: [];
  canEdit: false;
  canManage: false;
};

/** Full timeblock with view permission */
export type VisibleTimeblock = DecoratedResource<Doc<"timeblocks">> & {
  isBusy: false;
  googleEmail?: string;
};

/** Union type for timeblocks that may or may not be visible */
export type TimeblockWithVisibility = BusyTimeblock | VisibleTimeblock;

// Overload: "all" returns raw Doc<"timeblocks">[]
export async function getTimeblocksForUser(
  params: GetTimeblocksParams & { retrievalMode: "all" },
): Promise<Doc<"timeblocks">[]>;

// Overload: "filter_not_allowed" returns decorated (user has view permission)
export async function getTimeblocksForUser(
  params: GetTimeblocksParams & { retrievalMode?: "filter_not_allowed" },
): Promise<DecoratedResource<Doc<"timeblocks">>[]>;

// Overload: "hide_not_allowed_details" returns mix of visible/busy
export async function getTimeblocksForUser(
  params: GetTimeblocksParams & { retrievalMode: "hide_not_allowed_details" },
): Promise<TimeblockWithVisibility[]>;

// Implementation
export async function getTimeblocksForUser({
  ctx,
  orgId,
  retrievalMode = "filter_not_allowed",
  forUserId,
  currentUser,
  currentDate,
  range,
}: GetTimeblocksParams & { retrievalMode?: RetrievalMode }): Promise<
  | Doc<"timeblocks">[]
  | DecoratedResource<Doc<"timeblocks">>[]
  | TimeblockWithVisibility[]
> {
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

  if (retrievalMode === "all") {
    return allTimeblocks;
  }

  if (retrievalMode === "filter_not_allowed") {
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

  // "hide_not_allowed_details": return all timeblocks, mask non-permitted as busy
  const decorated = await decorateResourceWithGrants({
    ctx,
    currentUser,
    resourceType: "timeblocks",
    resources: allTimeblocks,
  });

  // Look up Google emails for all Google-sourced timeblocks
  const googleEmailMap = await getGoogleEmailsForTimeblocks(
    ctx,
    orgId,
    decorated,
  );

  return decorated.map((tb): TimeblockWithVisibility => {
    const isOwner = tb.createdBy === currentUser.id;
    const hasViewPermission =
      isOwner ||
      getPermissionLevelFromGrants(currentUser, tb.permissions) !== null;

    if (hasViewPermission) {
      return {
        ...tb,
        isBusy: false as const,
        googleEmail: googleEmailMap.get(tb.createdBy),
      };
    }

    // Return minimal "busy" block without details
    return {
      _id: tb._id,
      _creationTime: tb._creationTime,
      startTime: tb.startTime,
      endTime: tb.endTime,
      timezone: tb.timezone,
      orgId: tb.orgId,
      createdBy: tb.createdBy,
      source: tb.source,
      recurrenceRule: tb.recurrenceRule,
      exceptionDates: tb.exceptionDates,
      updatedAt: tb.updatedAt,
      isBusy: true as const,
      title: "" as const,
      tagIds: [] as const,
      permissions: [] as const,
      canEdit: false as const,
      canManage: false as const,
    };
  });
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

/**
 * Look up Google Calendar connection emails for timeblocks with source="google"
 * Returns a Map of userId -> googleEmail
 */
async function getGoogleEmailsForTimeblocks(
  ctx: BaseQueryCtx,
  orgId: string,
  timeblocks: { source: Doc<"timeblocks">["source"]; createdBy: string }[],
): Promise<Map<string, string>> {
  const googleEmailMap = new Map<string, string>();

  // Get unique userIds for google-sourced timeblocks
  const googleUserIds = [
    ...new Set(
      timeblocks
        .filter((tb) => tb.source === "google")
        .map((tb) => tb.createdBy),
    ),
  ];

  if (googleUserIds.length === 0) {
    return googleEmailMap;
  }

  // Look up connections for each user
  for (const userId of googleUserIds) {
    const connection = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .first();

    if (connection?.googleEmail) {
      googleEmailMap.set(userId, connection.googleEmail);
    }
  }

  return googleEmailMap;
}
