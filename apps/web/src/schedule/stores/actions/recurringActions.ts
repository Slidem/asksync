import {
  RecurringActionType,
  RecurringChoiceType,
  useRecurringDialogStore,
} from "../recurringDialogStore";

import { CalendarEvent } from "@/schedule/types";

/**
 * Recurring event dialog actions
 * Handles confirmation dialogs for recurring events
 */
export const recurringActions = {
  /**
   * Open the recurring event confirmation dialog
   */
  open: (params: {
    event: CalendarEvent;
    actionType: RecurringActionType;
    pendingChanges?: Partial<CalendarEvent>;
    onConfirm: (choice: RecurringChoiceType) => void;
  }) => {
    useRecurringDialogStore.getState().openDialog(params);
  },

  /**
   * Confirm the user's choice (this/all)
   */
  confirm: (choice: RecurringChoiceType) => {
    useRecurringDialogStore.getState().confirmChoice(choice);
  },

  /**
   * Close the dialog without confirming
   */
  cancel: () => {
    useRecurringDialogStore.getState().closeDialog();
  },

  /**
   * Check if dialog is open
   */
  isOpen: () => useRecurringDialogStore.getState().isOpen,

  /**
   * Get current dialog state
   */
  getState: () => {
    const state = useRecurringDialogStore.getState();
    return {
      isOpen: state.isOpen,
      event: state.event,
      actionType: state.actionType,
      pendingChanges: state.pendingChanges,
    };
  },
};
