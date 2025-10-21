"use client";

import { EventGap, EventHeight } from "@/schedule/constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { CalendarEvent } from "@/schedule/types";
import { MonthViewDayCell } from "./MonthViewDayCell";
import { MonthViewHeader } from "./MonthViewHeader";
import { useEventVisibility } from "@/schedule/hooks/eventVisibility";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date, endTime?: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weeks = useMemo(() => {
    const result = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        result.push(week);
        week = [];
      }
    }

    return result;
  }, [days]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div data-slot="month-view" className="contents">
      <MonthViewHeader />

      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div
            key={`week-${weekIndex}`}
            className="grid grid-cols-7 [&:last-child>*]:border-b-0"
          >
            {week.map((day, dayIndex) => {
              if (!day) return null;

              const isReferenceCell = weekIndex === 0 && dayIndex === 0;

              return (
                <MonthViewDayCell
                  key={day.toString()}
                  day={day}
                  currentDate={currentDate}
                  events={events}
                  isReferenceCell={isReferenceCell}
                  isMounted={isMounted}
                  contentRef={contentRef}
                  getVisibleEventCount={getVisibleEventCount}
                  onEventClick={handleEventClick}
                  onEventCreate={onEventCreate}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
