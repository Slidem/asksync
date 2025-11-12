import { CalendarEvent, PositionedEvent } from "@/schedule/types";
import { START_HOUR, WEEK_CELLS_HEIGHT_PX } from "@/schedule/constants";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";

import { useMemo } from "react";

/**
 * Custom hook to calculate positioned events for a single day
 * Uses the core positioning algorithm from utils
 */
export function useDayEventsPositioning(
  events: CalendarEvent[],
  date: Date,
): PositionedEvent[] {
  return useMemo(() => calculateEventPositions(events, date), [events, date]);
}

/**
 * Custom hook to calculate positioned events for multiple days (e.g., week view)
 * Returns an array of positioned events for each day
 * Uses the core positioning algorithm from utils
 */
export function useMultiDayEventPositioning(
  eventsByDay: CalendarEvent[][],
  days: Date[],
): PositionedEvent[][] {
  return useMemo(() => {
    return days.map((day, index) => {
      const events = eventsByDay[index] || [];
      return calculateEventPositions(events, day);
    });
  }, [eventsByDay, days]);
}
/**
 * Pure function to calculate positioned events for a single day
 * Handles overlapping events and column placement
 * This is the core positioning algorithm used by all calendar views
 */
function calculateEventPositions(
  events: CalendarEvent[],
  date: Date,
): PositionedEvent[] {
  const result: PositionedEvent[] = [];
  const dayStart = startOfDay(date);

  // Sort events by start time and duration
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    const aEnd = new Date(a.end);
    const bEnd = new Date(b.end);

    // First sort by start time
    if (aStart < bStart) return -1;
    if (aStart > bStart) return 1;

    // If start times are equal, sort by duration (longer events first)
    const aDuration = differenceInMinutes(aEnd, aStart);
    const bDuration = differenceInMinutes(bEnd, bStart);
    return bDuration - aDuration;
  });

  // Track columns for overlapping events
  const columns: { event: CalendarEvent; end: Date }[][] = [];

  sortedEvents.forEach((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Adjust start and end times if they're outside this day
    const adjustedStart = isSameDay(date, eventStart) ? eventStart : dayStart;
    const adjustedEnd = isSameDay(date, eventEnd)
      ? eventEnd
      : addHours(dayStart, 24);

    // Calculate top position and height
    const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
    const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;
    const top = (startHour - START_HOUR) * WEEK_CELLS_HEIGHT_PX;
    const height = (endHour - startHour) * WEEK_CELLS_HEIGHT_PX;

    // Find a column for this event
    let columnIndex = 0;
    let placed = false;

    while (!placed) {
      const col = columns[columnIndex] || [];
      if (col.length === 0) {
        columns[columnIndex] = col;
        placed = true;
      } else {
        const overlaps = col.some((c) =>
          areIntervalsOverlapping(
            { start: adjustedStart, end: adjustedEnd },
            { start: new Date(c.event.start), end: new Date(c.event.end) },
          ),
        );
        if (!overlaps) {
          placed = true;
        } else {
          columnIndex++;
        }
      }
    }

    // Ensure column is initialized before pushing
    const currentColumn = columns[columnIndex] || [];
    columns[columnIndex] = currentColumn;
    currentColumn.push({ event, end: adjustedEnd });

    // Calculate width and left position
    // First column takes full width, others are indented by 10% and take 90% width
    const width = columnIndex === 0 ? 1 : 0.9;
    const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

    result.push({
      event,
      top,
      height,
      left,
      width,
      zIndex: 10 + columnIndex, // Higher columns get higher z-index
    });
  });

  return result;
}
