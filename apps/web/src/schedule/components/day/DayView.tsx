"use client";

import { EndHour, StartHour, WeekCellsHeight } from "@/schedule/constants";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { isSameDay } from "date-fns";
import {
  isDragThresholdExceeded,
  useTemporaryEventStore,
} from "@/schedule/stores/temporaryEventStore";

import { CalendarEvent } from "@/schedule/types";
import { isMultiDayEvent } from "@/schedule/utils";
import { useCurrentTimeIndicator } from "@/schedule/hooks/currentTimeIndicator";
import { calculateEventPositions } from "@/schedule/utils/eventPositioning";
import {
  DayViewAllDaySection,
  DayViewTimeGrid,
} from "@/schedule/components/day";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date, endTime?: Date) => void;
}

export function DayView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: DayViewProps) {
  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          isSameDay(currentDate, eventStart) ||
          isSameDay(currentDate, eventEnd) ||
          (currentDate > eventStart && currentDate < eventEnd)
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [currentDate, events]);

  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => event.allDay || isMultiDayEvent(event));
  }, [dayEvents]);

  const positionedEvents = useMemo(() => {
    return calculateEventPositions(events, currentDate);
  }, [currentDate, events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

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

  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, startTime: Date) => {
      if (e.button !== 0) return;

      const position = { x: e.clientX, y: e.clientY };
      startCreating(startTime, position);
      isDraggingRef.current = false;

      e.preventDefault();
      e.stopPropagation();
    },
    [startCreating],
  );

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreating) {
        cancelCreating();
        isDraggingRef.current = false;
      }
    },
    [isCreating, cancelCreating],
  );

  useEffect(() => {
    if (!isCreating) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreating, handleMouseMove, handleMouseUp, handleKeyDown]);

  useEffect(() => {
    return () => {
      if (isCreating) {
        cancelCreating();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ghostEventPosition = useMemo(() => {
    if (!ghostEvent) return null;

    const startHour =
      ghostEvent.startTime.getHours() + ghostEvent.startTime.getMinutes() / 60;
    const endHour =
      ghostEvent.endTime.getHours() + ghostEvent.endTime.getMinutes() / 60;

    return {
      top: (startHour - StartHour) * WeekCellsHeight,
      height: (endHour - startHour) * WeekCellsHeight,
    };
  }, [ghostEvent]);

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "day",
  );

  return (
    <div ref={containerRef} data-slot="day-view" className="contents">
      <DayViewAllDaySection
        currentDate={currentDate}
        allDayEvents={allDayEvents}
        onEventClick={handleEventClick}
      />

      <DayViewTimeGrid
        currentDate={currentDate}
        positionedEvents={positionedEvents}
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
    </div>
  );
}
