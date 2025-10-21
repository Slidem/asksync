"use client";

import { EndHour, StartHour } from "@/schedule/constants";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  WeekViewDayColumn,
  WeekViewHeader,
  WeekViewTimeGrid,
} from "@/schedule/components/week";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import {
  isDragThresholdExceeded,
  useTemporaryEventStore,
} from "@/schedule/stores/temporaryEventStore";

import { CalendarEvent } from "@/schedule/types";
import { calculateEventPositions } from "@/schedule/utils/eventPositioning";
import { isMultiDayEvent } from "@/schedule/utils";
import { useCurrentTimeIndicator } from "@/schedule/hooks/currentTimeIndicator";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date, endTime?: Date) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => event.allDay || isMultiDayEvent(event))
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
    return days.map((day) => calculateEventPositions(events, day));
  }, [days, events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
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
  } = useTemporaryEventStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Handle mouse down on a cell
  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, startTime: Date, dayColumnIndex: number) => {
      if (e.button !== 0) return;

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

      if (!isDraggingRef.current) {
        if (isDragThresholdExceeded(dragStartPosition, currentPos)) {
          isDraggingRef.current = true;
        } else {
          return;
        }
      }

      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const hoursFraction = (relativeY / rect.height) * (EndHour - StartHour);
      const timeHours = StartHour + hoursFraction;

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
      onEventCreate(event.startTime);
    } else if (event && isDraggingRef.current) {
      onEventCreate(event.startTime, event.endTime);
    }

    isDraggingRef.current = false;
  }, [isCreating, finishCreating, onEventCreate]);

  // Set up global mouse event listeners for drag creation
  useEffect(() => {
    if (!isCreating) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCreating, handleMouseMove, handleMouseUp]);

  // Calculate ghost event position
  const ghostEventPosition = useMemo(() => {
    if (!ghostEvent) return null;

    const startHour =
      ghostEvent.startTime.getHours() + ghostEvent.startTime.getMinutes() / 60;
    const endHour =
      ghostEvent.endTime.getHours() + ghostEvent.endTime.getMinutes() / 60;

    const dayIndex = ghostEvent.dayColumnIndex ?? 0;

    return {
      dayIndex,
      top: (startHour - StartHour) * 60,
      height: (endHour - startHour) * 60,
    };
  }, [ghostEvent]);

  const { currentTimeVisible, currentTimePosition } = useCurrentTimeIndicator(
    currentDate,
    "week",
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto"
      data-slot="week-view"
    >
      <div className="border-border/70 grid flex-none grid-cols-8 border-b">
        <div className="border-border/70 border-r"></div>
        <div className="col-span-7 grid grid-cols-7">
          {days.map((day) => (
            <div
              key={day.toString()}
              className="border-border/70 min-w-0 border-r p-1 last:border-r-0 sm:p-2"
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="text-muted-foreground text-[10px] uppercase sm:text-xs">
                  {format(day, "EEE")}
                </div>
                <div className="text-foreground text-sm font-medium sm:text-base">
                  {format(day, "d")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WeekViewHeader
        days={days}
        allDayEvents={allDayEvents}
        onEventClick={handleEventClick}
      />

      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        <WeekViewTimeGrid currentDate={currentDate} />

        {days.map((day, dayIndex) => (
          <WeekViewDayColumn
            key={day.toString()}
            day={day}
            dayIndex={dayIndex}
            positionedEvents={processedDayEvents[dayIndex] ?? []}
            ghostEvent={ghostEvent}
            ghostEventPosition={ghostEventPosition}
            isDragging={isDragging}
            currentTimeVisible={currentTimeVisible}
            currentTimePosition={currentTimePosition}
            isCreating={isCreating}
            onEventClick={handleEventClick}
            onCellMouseDown={handleCellMouseDown}
            onEventCreate={onEventCreate}
          />
        ))}
      </div>
    </div>
  );
}
