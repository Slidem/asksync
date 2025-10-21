import { useRecurringDialogStore } from "../recurringDialogStore";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for recurring event confirmation dialog
 * Provides dialog state and confirmation methods
 */
export function useRecurringDialog() {
  const {
    isOpen,
    event,
    actionType,
    pendingChanges,
    confirmChoice,
    closeDialog,
  } = useRecurringDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      event: state.event,
      actionType: state.actionType,
      pendingChanges: state.pendingChanges,
      confirmChoice: state.confirmChoice,
      closeDialog: state.closeDialog,
    })),
  );

  return {
    isOpen,
    event,
    actionType,
    pendingChanges,
    confirmChoice,
    closeDialog,
  };
}
