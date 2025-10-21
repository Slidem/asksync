import { useCalendarStore } from "../calendarStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for accessing full calendar state
 * Useful when you need multiple state values
 */
export function useCalendarState() {
  return useCalendarStore(
    useShallow((state) => ({
      // View state
      currentDate: state.currentDate,
      view: state.view,

      // UI state
      isEventDialogOpen: state.isEventDialogOpen,
      selectedEventId: state.selectedEventId,

      // All actions
      goToToday: state.goToToday,
      goToPrevious: state.goToPrevious,
      goToNext: state.goToNext,
      goToDate: state.goToDate,
      setView: state.setView,
      openEventDialog: state.openEventDialog,
      closeEventDialog: state.closeEventDialog,

      // Computed
      getDateRange: state.getDateRange,
    })),
  );
}
