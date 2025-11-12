"use client";

import React, { useRef } from "react";
import { format, isSameDay } from "date-fns";
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
import { useDayEventsPositioning } from "@/schedule/hooks/eventsPositioning";
import { useEventsForCurrentScheduleView } from "@/schedule/hooks/eventsForCurrentScheduleView";
import { useFilteredDayEvents } from "@/schedule/hooks/filteredEvents";
import { useGhostEventHandlers } from "../hooks/ghostEvent";
import { useHourGrid } from "@/schedule/hooks/timeUtils";

/**
 * Day view calendar component
 * Uses extracted hooks and components for maintainability
 */
export function DayView() {
  const openSelectEventInDialog = useSelectEventInDialog();
  const openCreateEventDialog = useOpenCreateEventDialog();
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const events = useEventsForCurrentScheduleView();

  // Use extracted hooks
  const hours = useHourGrid(currentDate);
  const { allDayEvents, timeEvents } = useFilteredDayEvents(
    events,
    currentDate,
  );
  const positionedEvents = useDayEventsPositioning(timeEvents, currentDate);

  // Create event handler
  const handleEventClick = createEventClickHandler(openSelectEventInDialog);

  // Container ref for ghost event positioning
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
      data-slot="day-view"
      className="flex h-full flex-col"
    >
      {/* All-day events section */}
      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-t">
          <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
            <div className="relative">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            <div className="border-border/70 relative border-r p-1 last:border-r-0">
              {allDayEvents.map((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                const isFirstDay = isSameDay(currentDate, eventStart);
                const isLastDay = isSameDay(currentDate, eventEnd);

                return (
                  <EventItem
                    key={`spanning-${event.id}`}
                    onClick={(e) => handleEventClick(event, e)}
                    event={event}
                    view="month"
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                  >
                    <div>{event.title}</div>
                  </EventItem>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] overflow-hidden border-t sm:grid-cols-[4rem_1fr]">
        {/* Hour labels */}
        <div>
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {format(hour, "h a")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Events and grid */}
        <div className="relative">
          {/* Positioned events */}
          {positionedEvents.map((positionedEvent) => (
            <PositionedEventRenderer
              key={positionedEvent.event.id}
              positionedEvent={positionedEvent}
              view="day"
              onClick={handleEventClick}
            />
          ))}

          {/* Ghost event */}
          <GhostEventOverlay
            view="day"
            ghostEvent={ghostEvent}
            isDragging={isDragging}
          />

          {/* Current time indicator */}
          <CurrentTimeIndicator view="day" />

          {/* Quarter-hour grid */}
          {hours.map((hour) => (
            <QuarterHourGrid
              key={hour.toString()}
              hour={hour}
              date={currentDate}
              isCreating={isCreating}
              onMouseDown={handleCellMouseDown}
              onCellClick={handleCellClick}
              idPrefix="day-cell"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
