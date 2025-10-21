import { useCalendarStore } from "../calendarStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for calendar navigation functionality
 * Provides date navigation methods and current date
 */
export function useCalendarNavigation() {
  const { currentDate, goToToday, goToPrevious, goToNext, goToDate } =
    useCalendarStore(
      useShallow((state) => ({
        currentDate: state.currentDate,
        goToToday: state.goToToday,
        goToPrevious: state.goToPrevious,
        goToNext: state.goToNext,
        goToDate: state.goToDate,
      })),
    );

  return {
    currentDate,
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
  };
}
