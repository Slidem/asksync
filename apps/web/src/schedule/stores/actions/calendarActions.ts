import { CalendarView } from "@/schedule/types";
import { useCalendarStore } from "../calendarStore";

/**
 * Calendar navigation actions
 * Direct store manipulation without hooks for use in event handlers
 */
export const calendarActions = {
  navigate: {
    today: () => useCalendarStore.getState().goToToday(),
    previous: () => useCalendarStore.getState().goToPrevious(),
    next: () => useCalendarStore.getState().goToNext(),
    toDate: (date: Date) => useCalendarStore.getState().goToDate(date),
  },

  view: {
    change: (view: CalendarView) => useCalendarStore.getState().setView(view),
    get: () => useCalendarStore.getState().view,
  },

  dialog: {
    open: (eventId?: string) =>
      useCalendarStore.getState().openEventDialog(eventId),
    close: () => useCalendarStore.getState().closeEventDialog(),
    isOpen: () => useCalendarStore.getState().isEventDialogOpen,
  },

  state: {
    getCurrentDate: () => useCalendarStore.getState().currentDate,
    getDateRange: () => useCalendarStore.getState().getDateRange(),
  },
};
