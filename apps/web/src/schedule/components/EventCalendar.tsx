"use client";

import { CalendarEvent, CalendarView } from "@/schedule/types";
import { EventGap, EventHeight, WeekCellsHeight } from "@/schedule/constants";
import {
  useCalendarNavigation,
  useCalendarView,
  useEventDialog,
} from "@/schedule/stores";

import { AgendaView } from "@/schedule/components/AgendaView";
import { CalendarDndProvider } from "@/schedule/components/CalendarDndContext";
import { CalendarHeader } from "@/schedule/components/calendar";
import { DayView } from "@/schedule/components/day";
import { EventDialog } from "@/schedule/components/EventDialog";
import { MonthView } from "@/schedule/components/month";
import { Tag } from "@asksync/shared";
import { WeekView } from "@/schedule/components/week";
import { addHoursToDate } from "@/schedule/utils";
import { format } from "date-fns";
import { snapToQuarterHourMutate } from "@/schedule/utils/timeCalculations";
import { toast } from "sonner";
import { useState } from "react";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  availableTags?: Tag[];
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  availableTags = [],
  className,
  initialView = "month",
}: EventCalendarProps) {
  // Use store hooks
  const { currentDate } = useCalendarNavigation();
  const { view } = useCalendarView();
  const {
    isOpen: isEventDialogOpen,
    open: openEventDialog,
    close: closeEventDialog,
  } = useEventDialog();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const currentView = view || initialView;

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    openEventDialog(event.id);
  };

  const handleEventCreate = (startTime: Date, endTime?: Date) => {
    snapToQuarterHourMutate(startTime);
    const eventEnd = endTime || addHoursToDate(startTime, 1);

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: startTime,
      end: eventEnd,
      allDay: false,
    };
    setSelectedEvent(newEvent);
    openEventDialog();
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event);
      // Show toast notification when an event is updated
      toast(`Event "${event.title}" updated`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      });
      // Show toast notification when an event is added
      toast(`Event "${event.title}" added`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
    closeEventDialog();
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);
    closeEventDialog();
    setSelectedEvent(null);

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      toast(`Event "${deletedEvent.title}" deleted`, {
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    toast(`Event "${updatedEvent.title}" moved`, {
      description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
      position: "bottom-left",
    });
  };

  return (
    <div
      className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <CalendarHeader className={className} />

        <div className="flex flex-1 flex-col">
          {currentView === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {currentView === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {currentView === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {currentView === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            closeEventDialog();
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          availableTags={availableTags}
        />
      </CalendarDndProvider>
    </div>
  );
}
