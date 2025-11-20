import { CalendarView } from "@/schedule/types";
import { create } from "zustand";

interface State {
  calendarView: CalendarView;
  currentDate: Date;
  selectedUserId: string | null; // null = current user's calendar
  setCalendarView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedUserId: (userId: string | null) => void;
}

export const useCalendarViewStore = create<State>((set) => ({
  calendarView: CalendarView.WEEK,
  currentDate: new Date(),
  selectedUserId: null,
  setCalendarView: (view) => set({ calendarView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
}));
