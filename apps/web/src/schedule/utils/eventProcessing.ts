import {
  differenceInDays,
  endOfDay,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";

import { CalendarEvent } from "@/schedule/types";

// Cache for event processing results
const eventCache = new Map<string, CalendarEvent[]>();

// Generate cache key for a date
function getCacheKey(date: Date, suffix: string): string {
  return `${date.toISOString()}_${suffix}`;
}

// Optimized function to get events for a specific day
export function getEventsForDayOptimized(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  const cacheKey = getCacheKey(day, "day_events");

  if (eventCache.has(cacheKey)) {
    return eventCache.get(cacheKey)!;
  }

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const result = events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Event starts on this day
    if (isSameDay(eventStart, day)) return true;

    // Event ends on this day
    if (isSameDay(eventEnd, day)) return true;

    // Event spans across this day
    if (eventStart < dayStart && eventEnd > dayEnd) return true;

    return false;
  });

  eventCache.set(cacheKey, result);
  return result;
}

// Optimized function to get spanning events for a day
export function getSpanningEventsForDayOptimized(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  const cacheKey = getCacheKey(day, "spanning_events");

  if (eventCache.has(cacheKey)) {
    return eventCache.get(cacheKey)!;
  }

  const result = events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Multi-day or all-day events that include this day
    if (event.allDay || differenceInDays(eventEnd, eventStart) >= 1) {
      return isWithinInterval(day, { start: eventStart, end: eventEnd });
    }

    return false;
  });

  eventCache.set(cacheKey, result);
  return result;
}

// Clear cache when events change
export function clearEventCache() {
  eventCache.clear();
}

// Batch process events for multiple days at once
export function batchProcessEventsForDays(
  events: CalendarEvent[],
  days: Date[],
): Map<
  string,
  {
    dayEvents: CalendarEvent[];
    spanningEvents: CalendarEvent[];
    allEvents: CalendarEvent[];
  }
> {
  const result = new Map();

  // Pre-sort events once
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = new Date(a.start).getTime();
    const bStart = new Date(b.start).getTime();
    if (aStart !== bStart) return aStart - bStart;

    const aEnd = new Date(a.end).getTime();
    const bEnd = new Date(b.end).getTime();
    return aEnd - bEnd;
  });

  days.forEach((day) => {
    const dayKey = day.toISOString();
    const dayEvents = getEventsForDayOptimized(sortedEvents, day);
    const spanningEvents = getSpanningEventsForDayOptimized(sortedEvents, day);

    result.set(dayKey, {
      dayEvents,
      spanningEvents,
      allEvents: [...new Set([...dayEvents, ...spanningEvents])], // Remove duplicates
    });
  });

  return result;
}
