import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

import { AgendaDaysToShow } from "@/schedule/constants";
import { CalendarView } from "@/schedule/types";
import { create } from "zustand";

interface CalendarState {
  // View state
  currentDate: Date;
  view: CalendarView;

  // UI state
  isEventDialogOpen: boolean;
  selectedEventId: string | null;

  // Actions - Navigation
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;

  // Actions - View
  setView: (view: CalendarView) => void;

  // Actions - Dialog
  openEventDialog: (eventId?: string) => void;
  closeEventDialog: () => void;

  // Computed helpers
  getDateRange: () => { start: Date; end: Date };
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  view: "week",
  isEventDialogOpen: false,
  selectedEventId: null,

  // Navigation actions
  goToToday: () => set({ currentDate: new Date() }),

  goToPrevious: () => {
    const { view, currentDate } = get();
    let newDate: Date;

    switch (view) {
      case "month":
        newDate = subMonths(currentDate, 1);
        break;
      case "week":
        newDate = subWeeks(currentDate, 1);
        break;
      case "day":
        newDate = subDays(currentDate, 1);
        break;
      case "agenda":
        newDate = subDays(currentDate, AgendaDaysToShow);
        break;
      default:
        newDate = currentDate;
    }

    set({ currentDate: newDate });
  },

  goToNext: () => {
    const { view, currentDate } = get();
    let newDate: Date;

    switch (view) {
      case "month":
        newDate = addMonths(currentDate, 1);
        break;
      case "week":
        newDate = addWeeks(currentDate, 1);
        break;
      case "day":
        newDate = addDays(currentDate, 1);
        break;
      case "agenda":
        newDate = addDays(currentDate, AgendaDaysToShow);
        break;
      default:
        newDate = currentDate;
    }

    set({ currentDate: newDate });
  },

  goToDate: (date) => set({ currentDate: date }),

  // View actions
  setView: (view) => set({ view }),

  // Dialog actions
  openEventDialog: (eventId) =>
    set({
      isEventDialogOpen: true,
      selectedEventId: eventId || null,
    }),

  closeEventDialog: () =>
    set({
      isEventDialogOpen: false,
      selectedEventId: null,
    }),

  // Computed helpers
  getDateRange: () => {
    const { view, currentDate } = get();

    switch (view) {
      case "month": {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        // Include days from previous/next month that appear in the calendar grid
        const calendarStart = startOfWeek(start);
        const calendarEnd = endOfWeek(end);
        return { start: calendarStart, end: calendarEnd };
      }
      case "week": {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return { start, end };
      }
      case "day":
        return { start: currentDate, end: currentDate };
      case "agenda": {
        const end = addDays(currentDate, AgendaDaysToShow - 1);
        return { start: currentDate, end };
      }
      default:
        return { start: currentDate, end: currentDate };
    }
  },
}));
