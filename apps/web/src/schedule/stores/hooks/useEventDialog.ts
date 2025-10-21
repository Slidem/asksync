import { useCalendarStore } from "../calendarStore";
import { useEventDialogStore } from "../eventDialogStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for event dialog management
 * Provides dialog state and form data
 */
export function useEventDialog() {
  const { isOpen, selectedEventId, open, close } = useCalendarStore(
    useShallow((state) => ({
      isOpen: state.isEventDialogOpen,
      selectedEventId: state.selectedEventId,
      open: state.openEventDialog,
      close: state.closeEventDialog,
    })),
  );

  // Get the entire event form store
  const eventForm = useEventDialogStore();

  return {
    isOpen,
    selectedEventId,
    open,
    close,
    form: eventForm,
  };
}
