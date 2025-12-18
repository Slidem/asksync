import {
  CalendarEvent,
  EventColor,
  RecurrenceRule,
  Timeblock,
} from "@asksync/shared";
import { END_HOUR, START_HOUR } from "@/schedule/constants";
import { format, isSameDay } from "date-fns";

import type { TimeOption } from "@/schedule/types";

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";

  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean,
): string {
  if (isFirstDay && isLastDay) {
    return "rounded"; // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none"; // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none"; // Only right end rounded
  } else {
    return "rounded-none"; // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => isEventSameDay(event, day))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function isEventSameDay(event: CalendarEvent, day: Date): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return (
    isSameDay(day, eventStart) ||
    isSameDay(day, eventEnd) ||
    (eventStart < day && eventEnd > day)
  );
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

// Color mapping for timeblocks based on source
const TIME_BLOCK_COLOR_MAP: Record<string, EventColor> = {
  asksync: "violet",
  google: "sky",
  outlook: "amber",
  default: "emerald",
};

// Convert a timeblock to a calendar event
export function timeblockToCalendarEvent(timeblock: Timeblock): CalendarEvent {
  const isExternal = timeblock.source !== "asksync";

  return {
    id: timeblock.id,
    title: timeblock.title,
    description: timeblock.description,
    location: timeblock.location,
    start: new Date(timeblock.startTime),
    end: new Date(timeblock.endTime),
    allDay: false, // Timeblocks are typically specific time ranges
    color:
      (timeblock.color as EventColor) ||
      TIME_BLOCK_COLOR_MAP[timeblock.source] ||
      TIME_BLOCK_COLOR_MAP.default,
    tagIds: timeblock.tagIds,
    recurrenceRule: timeblock.recurrenceRule,
    source: timeblock.source,
    externalId: timeblock.externalId,
    timezone: timeblock.timezone,
    canEdit: !isExternal,
    canDelete: !isExternal,
    canEditTags: true,
    permissions: timeblock.permissions || [],
    checklistsVisible: timeblock.checklistsVisible ?? false,
    taskCount: timeblock.taskCount,
  };
}

// Convert a calendar event to timeblock creation data
export function calendarEventToCreateTimeblock(event: CalendarEvent) {
  return {
    title: event.title,
    description: event.description,
    startTime: event.start.getTime(),
    endTime: event.end.getTime(),
    timezone:
      event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurrenceRule: event.recurrenceRule,
    tagIds: event.tagIds || [],
    color: event.color, // Include the selected color
    checklistsVisible: event.checklistsVisible ?? false,
  };
}

// Convert a calendar event to timeblock update data
export function calendarEventToUpdateTimeblock(event: CalendarEvent) {
  const updateData: Partial<{
    title: string;
    description: string;
    location: string;
    startTime: number;
    endTime: number;
    timezone: string;
    recurrenceRule?: RecurrenceRule | null;
    tagIds: string[];
    source: string;
    externalId?: string;
    color?: string;
    checklistsVisible?: boolean;
  }> = {};

  // For external events, only update tags
  if (event.source && event.source !== "asksync") {
    updateData.tagIds = event.tagIds || [];
    return updateData;
  }

  // For AskSync events, update all fields
  updateData.title = event.title;
  updateData.description = event.description;
  updateData.location = event.location;
  updateData.startTime = event.start.getTime();
  updateData.endTime = event.end.getTime();
  updateData.timezone =
    event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  updateData.recurrenceRule = event.recurrenceRule;
  updateData.tagIds = event.tagIds || [];
  updateData.color = event.color; // Include the selected color
  updateData.checklistsVisible = event.checklistsVisible;

  return updateData;
}

// Helper function to create a recurring instance
function createRecurringInstance(
  baseEvent: CalendarEvent,
  timeblockId: string,
  instanceDate: Date,
  originalStart: Date,
  duration: number,
  exceptionDates: number[] = [],
): CalendarEvent | null {
  // Check if this date is in the exception list
  const instanceMidnight = getUTCMidnight(instanceDate);
  if (exceptionDates.includes(instanceMidnight)) {
    return null; // Skip this instance
  }

  const instanceStart = new Date(
    instanceDate.getFullYear(),
    instanceDate.getMonth(),
    instanceDate.getDate(),
    originalStart.getHours(),
    originalStart.getMinutes(),
    originalStart.getSeconds(),
  );

  return {
    ...baseEvent,
    id: timeblockId,
    start: instanceStart,
    end: new Date(instanceStart.getTime() + duration),
  };
}

// Generate recurring event instances
export function generateRecurringInstances(
  timeblock: Timeblock,
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  if (!timeblock.recurrenceRule) {
    return [timeblockToCalendarEvent(timeblock)];
  }

  // Validate date range
  if (startDate > endDate) {
    return [timeblockToCalendarEvent(timeblock)];
  }

  const instances: CalendarEvent[] = [];
  const duration = timeblock.endTime - timeblock.startTime;
  const rule = timeblock.recurrenceRule.toUpperCase();
  const baseEvent = timeblockToCalendarEvent(timeblock);
  const originalStart = new Date(timeblock.startTime);
  const exceptionDates = timeblock.exceptionDates || [];

  if (rule.includes("FREQ=DAILY")) {
    // Generate daily instances for all days within the range
    const current = new Date(startDate);
    while (current <= endDate) {
      const instance = createRecurringInstance(
        baseEvent,
        timeblock.id,
        current,
        originalStart,
        duration,
        exceptionDates,
      );
      if (instance) {
        instances.push(instance);
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (rule.includes("FREQ=WEEKLY")) {
    if (rule.includes("BYDAY=MO,TU,WE,TH,FR")) {
      // Weekdays pattern - generate for every weekday in the range
      const current = new Date(startDate);
      while (current <= endDate) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Monday to Friday
          const instance = createRecurringInstance(
            baseEvent,
            timeblock.id,
            current,
            originalStart,
            duration,
            exceptionDates,
          );
          if (instance) {
            instances.push(instance);
          }
        }
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Regular weekly pattern - generate instances going both directions from original date

      // Add instances going forward from the original date
      const forwardCurrent = new Date(originalStart);
      while (forwardCurrent <= endDate) {
        if (forwardCurrent >= startDate) {
          const instance = createRecurringInstance(
            baseEvent,
            timeblock.id,
            forwardCurrent,
            originalStart,
            duration,
            exceptionDates,
          );
          if (instance) {
            instances.push(instance);
          }
        }
        forwardCurrent.setDate(forwardCurrent.getDate() + 7);
      }

      // Add instances going backward from the original date
      const backwardCurrent = new Date(originalStart);
      backwardCurrent.setDate(backwardCurrent.getDate() - 7); // Start one week before
      while (backwardCurrent >= startDate) {
        if (backwardCurrent <= endDate) {
          const instance = createRecurringInstance(
            baseEvent,
            timeblock.id,
            backwardCurrent,
            originalStart,
            duration,
            exceptionDates,
          );
          if (instance) {
            instances.push(instance);
          }
        }
        backwardCurrent.setDate(backwardCurrent.getDate() - 7);
      }
    }
  }

  return instances;
}

// Expand all recurring events for a given date range
export function expandRecurringEvents(
  timeblocks: Timeblock[],
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  const allEvents: CalendarEvent[] = [];

  for (const timeblock of timeblocks) {
    const events = generateRecurringInstances(timeblock, startDate, endDate);
    allEvents.push(...events);
  }

  return allEvents;
}

const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      const value = `${formattedHour}:${formattedMinute}`;
      // Use a fixed date to avoid unnecessary date object creations
      const date = new Date(2000, 0, 1, hour, minute);
      const label = format(date, "h:mm a");
      options.push({ value, label });
    }
  }
  return options;
};
/**
 * Pre-generated time options for calendar events.
 */

export const calendarTimeOptions: TimeOption[] = generateTimeOptions();

export const getUTCMidnight = (date: Date): number => {
  const utcDate = new Date(date);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate.getTime();
};
/**
 * Common event handler for clicking on calendar events
 * Stops propagation and opens the event dialog
 */

export function createEventClickHandler(
  openSelectEventInDialog: (event: CalendarEvent) => void,
) {
  return (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    openSelectEventInDialog(event);
  };
}
