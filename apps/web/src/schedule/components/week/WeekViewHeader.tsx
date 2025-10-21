"use client";

import { isBefore, isSameDay, isToday, startOfWeek } from "date-fns";

import { CalendarEvent } from "@/schedule/types";
import { EventItem } from "@/schedule/components/EventItem";
import { cn } from "@/lib/utils";

interface WeekViewHeaderProps {
  days: Date[];
  allDayEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export function WeekViewHeader({
  days,
  allDayEvents,
  onEventClick,
}: WeekViewHeaderProps) {
  const weekStart = startOfWeek(days[0], { weekStartsOn: 0 });

  if (allDayEvents.length === 0) {
    return null;
  }

  return (
    <div className="border-border/70 grid flex-none grid-cols-8 border-b">
      <div className="border-border/70 border-r"></div>
      <div className="col-span-7 grid grid-cols-7">
        {days.map((day, dayIndex) => {
          const dayAllDayEvents = allDayEvents.filter((event) => {
            const evStart = new Date(event.start);
            const evEnd = new Date(event.end);
            return (
              isSameDay(day, evStart) ||
              (day > evStart && day < evEnd) ||
              isSameDay(day, evEnd)
            );
          });

          return (
            <div
              key={day.toString()}
              className="border-border/70 relative border-r p-1 last:border-r-0"
              data-today={isToday(day) || undefined}
            >
              {dayAllDayEvents.map((event) => {
                const evStart = new Date(event.start);
                const evEnd = new Date(event.end);
                const isFirstDay = isSameDay(day, evStart);
                const isLastDay = isSameDay(day, evEnd);
                const isFirstVisibleDay =
                  dayIndex === 0 && isBefore(evStart, weekStart);
                const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                return (
                  <EventItem
                    key={`spanning-${event.id}`}
                    onClick={(e) => onEventClick(event, e)}
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
  );
}
