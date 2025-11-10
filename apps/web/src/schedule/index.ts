"use client";

// Component exports
export { AgendaView } from "./components/AgendaView";
export { DayView } from "./components/DayView";
export { DraggableEvent } from "./components/DraggableEvent";
export { DroppableCell } from "./components/DroppableCell";
export { EventDialog } from "./dialogs/eventDialog/components/EventDialog";
export { EventItem } from "./components/EventItem";
export { EventsPopup } from "./components/EventsPopup";
export { EventCalendar } from "./components/EventCalendar";
export { MonthView } from "./components/MonthView";
export { WeekView } from "./components/WeekView";
export {
  CalendarDndProvider,
  useCalendarDnd,
} from "./components/CalendarDndContext";

// Constants and utility exports
export * from "./constants";
export * from "./utils";

// Hook exports
export * from "./hooks/currentTimeIndicator";
export * from "./hooks/eventVisibility";

// Type exports
export type { CalendarEvent, CalendarView, EventColor } from "./types";
