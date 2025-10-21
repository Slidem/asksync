"use client";

import { CalendarEvent } from "@/schedule/types";
import { DefaultStartHour } from "@/schedule/constants";
import { format, isSameMonth, isToday } from "date-fns";
import { DroppableCell } from "@/schedule/components/DroppableCell";
import {
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
} from "@/schedule/utils";
import { MonthViewEventList } from "./MonthViewEventList";
import { MonthViewMorePopover } from "./MonthViewMorePopover";
import React from "react";

interface MonthViewDayCellProps {
  day: Date;
  currentDate: Date;
  events: CalendarEvent[];
  isReferenceCell: boolean;
  isMounted: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  getVisibleEventCount: (totalEvents: number) => number;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

export function MonthViewDayCell({
  day,
  currentDate,
  events,
  isReferenceCell,
  isMounted,
  contentRef,
  getVisibleEventCount,
  onEventClick,
  onEventCreate,
}: MonthViewDayCellProps) {
  const dayEvents = getEventsForDay(events, day);
  const spanningEvents = getSpanningEventsForDay(events, day);
  const isCurrentMonth = isSameMonth(day, currentDate);
  const cellId = `month-cell-${day.toISOString()}`;
  const allDayEvents = [...spanningEvents, ...dayEvents];
  const allEvents = getAllEventsForDay(events, day);

  const visibleCount = isMounted
    ? getVisibleEventCount(allDayEvents.length)
    : undefined;
  const hasMore =
    visibleCount !== undefined && allDayEvents.length > visibleCount;
  const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0;

  return (
    <div
      className="group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b last:border-r-0"
      data-today={isToday(day) || undefined}
      data-outside-cell={!isCurrentMonth || undefined}
    >
      <DroppableCell
        id={cellId}
        date={day}
        onClick={() => {
          const startTime = new Date(day);
          startTime.setHours(DefaultStartHour, 0, 0);
          onEventCreate(startTime);
        }}
      >
        <div className="group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm">
          {format(day, "d")}
        </div>
        <div
          ref={isReferenceCell ? contentRef : null}
          className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
        >
          <MonthViewEventList
            day={day}
            events={allDayEvents}
            visibleCount={visibleCount}
            isMounted={isMounted}
            onEventClick={onEventClick}
          />

          {hasMore && (
            <MonthViewMorePopover
              day={day}
              remainingCount={remainingCount}
              allEvents={allEvents}
              onEventClick={onEventClick}
            />
          )}
        </div>
      </DroppableCell>
    </div>
  );
}
