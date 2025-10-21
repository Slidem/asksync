import { StartHour, WeekCellsHeight } from "@/schedule/constants";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";

import { CalendarEvent } from "@/schedule/types";
import { isMultiDayEvent } from "@/schedule/utils";

export interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function calculateEventPositions(
  events: CalendarEvent[],
  day: Date,
): PositionedEvent[] {
  // Get events for this day that are not all-day events or multi-day events
  const dayEvents = events.filter((event) => {
    if (event.allDay || isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (eventStart < day && eventEnd > day)
    );
  });

  // Sort events by start time and duration
  const sortedEvents = [...dayEvents].sort((a, b) => {
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

  // Calculate positions for each event
  const positionedEvents: PositionedEvent[] = [];
  const dayStart = startOfDay(day);

  // Track columns for overlapping events
  const columns: { event: CalendarEvent; end: Date }[][] = [];

  sortedEvents.forEach((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Adjust start and end times if they're outside this day
    const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart;
    const adjustedEnd = isSameDay(day, eventEnd)
      ? eventEnd
      : addHours(dayStart, 24);

    // Calculate top position and height
    const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
    const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

    const top = (startHour - StartHour) * WeekCellsHeight;
    const height = (endHour - startHour) * WeekCellsHeight;

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

    // Calculate width and left position based on number of columns
    const width = columnIndex === 0 ? 1 : 0.9;
    const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

    positionedEvents.push({
      event,
      top,
      height,
      left,
      width,
      zIndex: 10 + columnIndex,
    });
  });

  return positionedEvents;
}
