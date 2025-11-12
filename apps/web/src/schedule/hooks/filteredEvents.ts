import {
  getEventsForDay,
  isEventSameDay,
  isMultiDayEvent,
} from "@/schedule/utils";

import { CalendarEvent } from "@/schedule/types";
import { useMemo } from "react";

/**
 * Custom hook to filter events for a specific day or date range
 * Separates all-day/multi-day events from time-based events
 */
export function useFilteredDayEvents(
  events: CalendarEvent[],
  date: Date,
): {
  allDayEvents: CalendarEvent[];
  timeEvents: CalendarEvent[];
  dayEvents: CalendarEvent[];
} {
  return useMemo(() => {
    const dayEvents = getEventsForDay(events, date);
    const allDayEvents = dayEvents.filter(isMultiDayEvent);
    const timeEvents = dayEvents.filter((event) => !isMultiDayEvent(event));

    return {
      allDayEvents,
      timeEvents,
      dayEvents,
    };
  }, [events, date]);
}

/**
 * Custom hook to filter events for a week view
 * Returns events that fall within any of the provided days
 */
export function useFilteredWeekEvents(
  events: CalendarEvent[],
  weekDays: Date[],
): {
  allDayEvents: CalendarEvent[];
  timeEventsByDay: CalendarEvent[][];
} {
  return useMemo(() => {
    // Get all-day events for the week
    const allDayEvents = events.filter(isMultiDayEvent).filter((event) => {
      return weekDays.some((day) => isEventSameDay(event, day));
    });

    // Get time-based events for each day
    const timeEventsByDay = weekDays.map((day) => {
      return events.filter((event) => {
        if (isMultiDayEvent(event)) return false;
        return isEventSameDay(event, day);
      });
    });

    return {
      allDayEvents,
      timeEventsByDay,
    };
  }, [events, weekDays]);
}
