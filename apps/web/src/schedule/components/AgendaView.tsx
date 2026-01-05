"use client";

import { addDays, format, isToday } from "date-fns";

import { AGENDA_DAYS_TO_SHOW } from "@/schedule/constants";
import { EventItem } from "@/schedule/components/EventItem";
import { BusyEventItem } from "@/schedule/components/BusyEventItem";
import { RiCalendarEventLine } from "@remixicon/react";
import { createEventClickHandler } from "../utils";
import { getEventsForDay } from "@/schedule/utils";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useEventsForCurrentScheduleView } from "@/schedule/hooks/eventsForCurrentScheduleView";
import { useMemo } from "react";
import { useSelectEventInDialog } from "@/schedule/dialogs/eventDialog/eventDialogService";

export function AgendaView() {
  const openSelectEventInDialog = useSelectEventInDialog();

  const currentDate = useCalendarViewStore((state) => state.currentDate);

  const events = useEventsForCurrentScheduleView();

  const days = useMemo(() => {
    return Array.from({ length: AGENDA_DAYS_TO_SHOW }, (_, i) =>
      addDays(new Date(currentDate), i),
    );
  }, [currentDate]);

  const handleEventClick = createEventClickHandler(openSelectEventInDialog);

  // Check if there are any days with events
  const hasEvents = days.some((day) => getEventsForDay(events, day).length > 0);

  return (
    <div className="border-border/70 border-t px-4">
      {!hasEvents ? (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
          <RiCalendarEventLine
            size={32}
            className="text-muted-foreground/50 mb-2"
          />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">
            There are no events scheduled for this time period.
          </p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getEventsForDay(events, day);

          if (dayEvents.length === 0) return null;

          return (
            <div
              key={day.toString()}
              className="border-border/70 relative my-12 border-t"
            >
              <span
                className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                data-today={isToday(day) || undefined}
              >
                {format(day, "d MMM, EEEE")}
              </span>
              <div className="mt-6 space-y-2">
                {dayEvents.map((event) =>
                  event.isBusy ? (
                    <BusyEventItem
                      key={event.id}
                      start={event.start}
                      end={event.end}
                      view="agenda"
                    />
                  ) : (
                    <EventItem
                      key={event.id}
                      event={event}
                      view="agenda"
                      onClick={(e) => handleEventClick(event, e)}
                    />
                  ),
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
