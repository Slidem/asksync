/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import {
  END_HOUR,
  START_HOUR,
  WEEK_CELLS_HEIGHT_PX,
} from "@/schedule/constants";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import {
  isDragThresholdExceeded,
  useTemporaryEventStore,
} from "@/schedule/stores/temporaryEventStore";
import {
  useOpenCreateEventDialog,
  useSelectEventInDialog,
} from "@/schedule/dialogs/eventDialog/eventDialogService";

import { CalendarEvent } from "@/schedule/types";
import { DraggableEvent } from "@/schedule/components/DraggableEvent";
import { DroppableCell } from "@/schedule/components/DroppableCell";
import { EventItem } from "@/schedule/components/EventItem";
import { GhostEvent } from "@/schedule/components/GhostEvent";
import { cn } from "@/lib/utils";
import { isMultiDayEvent } from "@/schedule/utils";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useCurrentTimeIndicator } from "@/schedule/hooks/currentTimeIndicator";
import { useEventsForCurrentScheduleView } from "@/schedule/hooks/eventsService";

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function WeekView() {
  const openSelectEventInDialog = useSelectEventInDialog();

  const openCreateEventDialog = useOpenCreateEventDialog();

  const currentDate = useCalendarViewStore((state) => state.currentDate);

  const events = useEventsForCurrentScheduleView();

  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate],
  );

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, START_HOUR),
      end: addHours(dayStart, END_HOUR - 1),
    });
  }, [currentDate]);

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include explicitly marked all-day events or multi-day events
        return event.allDay || isMultiDayEvent(event);
      })
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd),
        );
      });
  }, [events, days]);

  // Process events for each day to calculate positions
  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      // Get events for this day that are not all-day events or multi-day events
      const dayEvents = events.filter((event) => {
        // Skip all-day events and multi-day events
        if (event.allDay || isMultiDayEvent(event)) return false;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Check if event is on this day
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
        const adjustedStart = isSameDay(day, eventStart)
          ? eventStart
          : dayStart;
        const adjustedEnd = isSameDay(day, eventEnd)
          ? eventEnd
          : addHours(dayStart, 24);

        // Calculate top position and height
        const startHour =
          getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

        // Adjust the top calculation to account for the new start time
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
                {
                  start: new Date(c.event.start),
                  end: new Date(c.event.end),
                },
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
          zIndex: 10 + columnIndex, // Higher columns get higher z-index
        });
      });

      return positionedEvents;
    });

    return result;
  }, [days, events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    openSelectEventInDialog(event);
  };

  // Ghost event state and handlers
  const {
    ghostEvent,
    isCreating,
    isDragging,
    dragStartPosition,
    startCreating,
    updateCreating,
    finishCreating,
    cancelCreating,
  } = useTemporaryEventStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Handle mouse down on a cell
  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, startTime: Date, dayColumnIndex: number) => {
      if (e.button !== 0) return; // Only handle left click

      const position = { x: e.clientX, y: e.clientY };
      startCreating(startTime, position, dayColumnIndex);
      isDraggingRef.current = false;

      e.preventDefault();
      e.stopPropagation();
    },
    [startCreating],
  );

  // Handle global mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isCreating || !dragStartPosition || !containerRef.current) return;

      const currentPos = { x: e.clientX, y: e.clientY };

      // Check if we've exceeded the drag threshold
      if (!isDraggingRef.current) {
        if (isDragThresholdExceeded(dragStartPosition, currentPos)) {
          isDraggingRef.current = true;
        } else {
          return; // Haven't started dragging yet
        }
      }

      // Calculate the time based on mouse position
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      // Calculate which hour we're hovering over
      const hoursFraction = (relativeY / rect.height) * (END_HOUR - START_HOUR);
      const timeHours = START_HOUR + hoursFraction;

      // Get the day column if in week view
      if (ghostEvent) {
        const endTime = new Date(ghostEvent.startTime);
        endTime.setHours(Math.floor(timeHours));
        endTime.setMinutes((timeHours % 1) * 60);

        updateCreating(endTime, true);
      }
    },
    [isCreating, dragStartPosition, ghostEvent, updateCreating],
  );

  // Handle global mouse up
  const handleMouseUp = useCallback(() => {
    if (!isCreating) return;

    const event = finishCreating();

    if (event && !isDraggingRef.current) {
      // If we didn't drag, create a 1-hour event (default behavior)
      openCreateEventDialog({ start: event.startTime });
    } else if (event && isDraggingRef.current) {
      // If we dragged, create event with the dragged duration
      openCreateEventDialog({ start: event.startTime, end: event.endTime });
    }

    isDraggingRef.current = false;
  }, [isCreating, finishCreating, openCreateEventDialog]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreating) {
        cancelCreating();
        isDraggingRef.current = false;
      }
    },
    [isCreating, cancelCreating],
  );

  // Set up global event listeners when creating
  useEffect(() => {
    if (isCreating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isCreating, handleMouseMove, handleMouseUp, handleKeyDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isCreating) {
        cancelCreating();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate ghost event position if it exists
  const ghostEventPosition = useMemo(() => {
    if (!ghostEvent || ghostEvent.dayColumnIndex === undefined) return null;

    const dayIndex = ghostEvent.dayColumnIndex;
    const startHour =
      ghostEvent.startTime.getHours() + ghostEvent.startTime.getMinutes() / 60;
    const endHour =
      ghostEvent.endTime.getHours() + ghostEvent.endTime.getMinutes() / 60;

    const top = (startHour - START_HOUR) * WEEK_CELLS_HEIGHT_PX;
    const height = (endHour - startHour) * WEEK_CELLS_HEIGHT_PX;

    return {
      top,
      height,
      dayIndex,
    };
  }, [ghostEvent]);

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week",
  );

  return (
    <div
      ref={containerRef}
      data-slot="week-view"
      className="flex h-full flex-col"
    >
      <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
        <div className="text-muted-foreground/70 py-2 text-center text-sm">
          <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium"
            data-today={isToday(day) || undefined}
          >
            <span className="sm:hidden" aria-hidden="true">
              {format(day, "E")[0]} {format(day, "d")}
            </span>
            <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
          </div>
        ))}
      </div>

      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-b">
          <div className="grid grid-cols-8">
            <div className="border-border/70 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (
                  isSameDay(day, eventStart) ||
                  (day > eventStart && day < eventEnd) ||
                  isSameDay(day, eventEnd)
                );
              });

              return (
                <div
                  key={day.toString()}
                  className="border-border/70 relative border-r p-1 last:border-r-0"
                  data-today={isToday(day) || undefined}
                >
                  {dayAllDayEvents.map((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const isFirstDay = isSameDay(day, eventStart);
                    const isLastDay = isSameDay(day, eventEnd);

                    // Check if this is the first day in the current week view
                    const isFirstVisibleDay =
                      dayIndex === 0 && isBefore(eventStart, weekStart);
                    const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                    return (
                      <EventItem
                        key={`spanning-${event.id}`}
                        onClick={(e) => handleEventClick(event, e)}
                        event={event}
                        view="month"
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      >
                        {/* Show title if it's the first day of the event or the first visible day in the week */}
                        <div
                          className={cn(
                            "truncate",
                            !shouldShowTitle && "invisible",
                          )}
                          aria-hidden={!shouldShowTitle}
                        >
                          {event.title}
                        </div>
                      </EventItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        <div className="border-border/70 grid auto-cols-fr border-r">
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {format(hour, "h a")}
                </span>
              )}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
            data-today={isToday(day) || undefined}
          >
            {/* Positioned events */}
            {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
              <div
                key={positionedEvent.event.id}
                className="absolute z-10 px-0.5"
                style={{
                  top: `${positionedEvent.top}px`,
                  height: `${positionedEvent.height}px`,
                  left: `${positionedEvent.left * 100}%`,
                  width: `${positionedEvent.width * 100}%`,
                  zIndex: positionedEvent.zIndex,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="size-full">
                  <DraggableEvent
                    event={positionedEvent.event}
                    view="week"
                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                    showTime
                    height={positionedEvent.height}
                  />
                </div>
              </div>
            ))}

            {/* Ghost event */}
            {ghostEventPosition && ghostEventPosition.dayIndex === dayIndex && (
              <div
                className="pointer-events-none absolute z-30 px-0.5"
                style={{
                  top: `${ghostEventPosition.top}px`,
                  height: `${ghostEventPosition.height}px`,
                  left: 0,
                  right: 0,
                }}
              >
                <GhostEvent
                  startTime={ghostEvent!.startTime}
                  endTime={ghostEvent!.endTime}
                  view="week"
                  isDragging={isDragging}
                />
              </div>
            )}

            {/* Current time indicator - only show for today's column */}
            {currentTimeVisible && isToday(day) && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                  <div className="bg-primary h-[2px] w-full"></div>
                </div>
              </div>
            )}
            {hours.map((hour) => {
              const hourValue = getHours(hour);
              return (
                <div
                  key={hour.toString()}
                  className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                >
                  {/* Quarter-hour intervals */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25;
                    return (
                      <DroppableCell
                        key={`${hour.toString()}-${quarter}`}
                        id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                        date={day}
                        time={quarterHourTime}
                        dayColumnIndex={dayIndex}
                        className={cn(
                          "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                          quarter === 0 && "top-0",
                          quarter === 1 &&
                            "top-[calc(var(--week-cells-height)/4)]",
                          quarter === 2 &&
                            "top-[calc(var(--week-cells-height)/4*2)]",
                          quarter === 3 &&
                            "top-[calc(var(--week-cells-height)/4*3)]",
                        )}
                        onMouseDown={(e, startTime) =>
                          handleCellMouseDown(e, startTime, dayIndex)
                        }
                        onClick={
                          !isCreating
                            ? () => {
                                const start = new Date(day);
                                start.setHours(hourValue);
                                start.setMinutes(quarter * 15);
                                openCreateEventDialog({ start });
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
