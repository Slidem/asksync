"use client";

import {
  EVENT_GAP_PX,
  EVENT_HEIGHT_PX,
  WEEK_CELLS_HEIGHT_PX,
} from "@/schedule/constants";

import { AgendaView } from "@/schedule/components/AgendaView";
import { CalendarDndProvider } from "@/schedule/components/CalendarDndContext";
import { DayView } from "@/schedule/components/DayView";
import { EventCalendarHeader } from "@/schedule/components/EventCalendarHeader";
import { MonthView } from "@/schedule/components/MonthView";
import { WeekView } from "@/schedule/components/WeekView";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";

export function EventCalendar() {
  const view = useCalendarViewStore((state) => state.calendarView);

  return (
    <div
      className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1 min-h-[600px]"
      style={
        {
          "--event-height": `${EVENT_HEIGHT_PX}px`,
          "--event-gap": `${EVENT_GAP_PX}px`,
          "--week-cells-height": `${WEEK_CELLS_HEIGHT_PX}px`,
        } as React.CSSProperties
      }
    >
      <EventCalendarHeader />
      <CalendarDndProvider>
        <div className="flex flex-1 flex-col">
          {view === "month" && <MonthView />}
          {view === "week" && <WeekView />}
          {view === "day" && <DayView />}
          {view === "agenda" && <AgendaView />}
        </div>
      </CalendarDndProvider>
    </div>
  );
}
