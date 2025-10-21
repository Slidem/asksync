"use client";

import { CalendarEvent } from "@/schedule/types";
import { isSameDay } from "date-fns";
import { EventItem } from "@/schedule/components/EventItem";

interface DayViewAllDaySectionProps {
  currentDate: Date;
  allDayEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export function DayViewAllDaySection({
  currentDate,
  allDayEvents,
  onEventClick,
}: DayViewAllDaySectionProps) {
  if (allDayEvents.length === 0) return null;

  return (
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
                onClick={(e) => onEventClick(event, e)}
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
  );
}
