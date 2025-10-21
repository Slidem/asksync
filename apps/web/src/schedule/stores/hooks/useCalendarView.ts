import { useCalendarStore } from "../calendarStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for calendar view management
 * Provides current view and method to change it
 */
export function useCalendarView() {
  const { view, setView } = useCalendarStore(
    useShallow((state) => ({
      view: state.view,
      setView: state.setView,
    })),
  );

  return { view, setView };
}
