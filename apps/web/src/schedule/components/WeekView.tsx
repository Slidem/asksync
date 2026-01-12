"use client";

import React, { useMemo, useRef } from "react";
import { cn, noOp } from "@/lib/utils";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import {
  useOpenCreateEventDialog,
  useSelectEventInDialog,
} from "@/schedule/dialogs/eventDialog/eventDialogService";

import { CurrentTimeIndicator } from "@/schedule/components/CurrentTimeIndicator";
import { EventItem } from "@/schedule/components/EventItem";
import { GhostEventOverlay } from "@/schedule/components/GhostEventOverlay";
import { PositionedEventRenderer } from "@/schedule/components/PositionedEventRenderer";
import { QuarterHourGrid } from "@/schedule/components/QuarterHourGrid";
import { createEventClickHandler } from "../utils";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useEventsForCurrentScheduleView } from "@/schedule/hooks/eventsForCurrentScheduleView";
import { useFilteredWeekEvents } from "@/schedule/hooks/filteredEvents";
import { useGhostEventHandlers } from "../hooks/ghostEvent";
import { useHourGrid } from "@/schedule/hooks/timeUtils";
import { useMultiDayEventPositioning } from "../hooks/eventsPositioning";
import { useOpenAskQuestionDialog } from "@/schedule/dialogs/askQuestion/askQuestionDialogService";

/**
 * Week view calendar component
 * Uses extracted hooks and components for maintainability
 */
export function WeekView(): React.ReactNode {
  const openSelectEventInDialog = useSelectEventInDialog();
  const openAskQuestionDialog = useOpenAskQuestionDialog();
  const openCreateEventDialog = useOpenCreateEventDialog();
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);
  const events = useEventsForCurrentScheduleView();

  const isReadOnly = selectedUserId !== null;

  // Calculate days and hours
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate],
  );

  const hours = useHourGrid(currentDate);

  const { allDayEvents, timeEventsByDay } = useFilteredWeekEvents(events, days);

  const processedDayEvents = useMultiDayEventPositioning(timeEventsByDay, days);

  // Use different click handlers based on whether viewing another user's calendar
  const handleEventClick = createEventClickHandler(
    isReadOnly ? openAskQuestionDialog : openSelectEventInDialog,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Use the ghost event handlers hook
  const {
    ghostEvent,
    isCreating,
    isDragging,
    handleCellMouseDown,
    handleCellClick,
  } = useGhostEventHandlers({
    containerRef,
    onEventClick: openCreateEventDialog,
  });

  const showAllDaySection = allDayEvents.length > 0;

  return (
    <div
      ref={containerRef}
      data-slot="week-view"
      className="flex h-full flex-col"
    >
      {/* Day headers */}
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

      {/* All-day events section */}
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

      {/* Time grid */}
      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        {/* Hour labels */}
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

        {/* Day columns */}
        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
            data-today={isToday(day) || undefined}
          >
            {/* Positioned events for this day */}
            {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
              <PositionedEventRenderer
                key={positionedEvent.event.id}
                positionedEvent={positionedEvent}
                view="week"
                onClick={handleEventClick}
              />
            ))}

            {/* Ghost event */}
            {!isReadOnly && (
              <GhostEventOverlay
                view="week"
                dayIndex={dayIndex}
                ghostEvent={ghostEvent}
                isDragging={isDragging}
              />
            )}

            {/* Current time indicator */}
            <CurrentTimeIndicator view="week" day={day} />

            {/* Quarter-hour grid */}
            {hours.map((hour) => (
              <QuarterHourGrid
                key={hour.toString()}
                hour={hour}
                date={day}
                dayColumnIndex={dayIndex}
                isCreating={isCreating}
                onMouseDown={isReadOnly ? noOp : handleCellMouseDown}
                onCellClick={isReadOnly ? noOp : handleCellClick}
                idPrefix="week-cell"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
