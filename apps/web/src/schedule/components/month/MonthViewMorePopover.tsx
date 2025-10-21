"use client";

import { CalendarEvent } from "@/schedule/types";
import { EventHeight } from "@/schedule/constants";
import { format, isSameDay } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EventItem } from "@/schedule/components/EventItem";
import { sortEvents } from "@/schedule/utils";

interface MonthViewMorePopoverProps {
  day: Date;
  remainingCount: number;
  allEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export function MonthViewMorePopover({
  day,
  remainingCount,
  allEvents,
  onEventClick,
}: MonthViewMorePopoverProps) {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <button
          className="focus-visible:border-ring focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-[var(--event-gap)] flex h-[var(--event-height)] w-full items-center overflow-hidden px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <span>
            + {remainingCount} <span className="max-sm:sr-only">more</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="max-w-52 p-3"
        style={
          {
            "--event-height": `${EventHeight}px`,
          } as React.CSSProperties
        }
      >
        <div className="space-y-2">
          <div className="text-sm font-medium">{format(day, "EEE d")}</div>
          <div className="space-y-1">
            {sortEvents(allEvents).map((event) => {
              const eventStart = new Date(event.start);
              const eventEnd = new Date(event.end);
              const isFirstDay = isSameDay(day, eventStart);
              const isLastDay = isSameDay(day, eventEnd);

              return (
                <EventItem
                  key={event.id}
                  onClick={(e) => onEventClick(event, e)}
                  event={event}
                  view="month"
                  isFirstDay={isFirstDay}
                  isLastDay={isLastDay}
                />
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
