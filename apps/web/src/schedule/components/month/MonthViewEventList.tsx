"use client";

import { CalendarEvent } from "@/schedule/types";
import { format, isSameDay } from "date-fns";
import { DraggableEvent } from "@/schedule/components/DraggableEvent";
import { EventItem } from "@/schedule/components/EventItem";
import { sortEvents } from "@/schedule/utils";

interface MonthViewEventListProps {
  day: Date;
  events: CalendarEvent[];
  visibleCount: number | undefined;
  isMounted: boolean;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export function MonthViewEventList({
  day,
  events,
  visibleCount,
  isMounted,
  onEventClick,
}: MonthViewEventListProps) {
  return (
    <>
      {sortEvents(events).map((event, index) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const isFirstDay = isSameDay(day, eventStart);
        const isLastDay = isSameDay(day, eventEnd);

        const isHidden = isMounted && visibleCount && index >= visibleCount;

        if (!visibleCount) return null;

        if (!isFirstDay) {
          return (
            <div
              key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
              className="aria-hidden:hidden"
              aria-hidden={isHidden ? "true" : undefined}
            >
              <EventItem
                onClick={(e) => onEventClick(event, e)}
                event={event}
                view="month"
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
              >
                <div className="invisible" aria-hidden={true}>
                  {!event.allDay && (
                    <span>{format(new Date(event.start), "h:mm")} </span>
                  )}
                  {event.title}
                </div>
              </EventItem>
            </div>
          );
        }

        return (
          <div
            key={event.id}
            className="aria-hidden:hidden"
            aria-hidden={isHidden ? "true" : undefined}
          >
            <DraggableEvent
              event={event}
              view="month"
              onClick={(e) => onEventClick(event, e)}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
            />
          </div>
        );
      })}
    </>
  );
}
