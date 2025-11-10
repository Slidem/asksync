import { CalendarView } from "@/schedule/types";
import { create } from "zustand";

interface State {
  calendarView: CalendarView;
  currentDate: Date;
  setCalendarView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
}

export const useCalendarViewStore = create<State>((set) => ({
  calendarView: CalendarView.WEEK,
  currentDate: new Date(),
  setCalendarView: (view) => set({ calendarView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
}));
