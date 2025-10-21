import { CalendarEvent } from "@/schedule/types";
import { create } from "zustand";

export type RecurringActionType = "update" | "delete";
export type RecurringChoiceType = "this" | "all";

interface RecurringDialogState {
  // Dialog state
  isOpen: boolean;
  event: CalendarEvent | null;
  actionType: RecurringActionType | null;

  // Pending changes (for update action)
  pendingChanges: Partial<CalendarEvent> | null;

  // Callback to execute after user choice
  onConfirmCallback: ((choice: RecurringChoiceType) => void) | null;

  // Actions
  openDialog: (params: {
    event: CalendarEvent;
    actionType: RecurringActionType;
    pendingChanges?: Partial<CalendarEvent>;
    onConfirm: (choice: RecurringChoiceType) => void;
  }) => void;

  confirmChoice: (choice: RecurringChoiceType) => void;
  closeDialog: () => void;
}

export const useRecurringDialogStore = create<RecurringDialogState>(
  (set, get) => ({
    // Initial state
    isOpen: false,
    event: null,
    actionType: null,
    pendingChanges: null,
    onConfirmCallback: null,

    // Actions
    openDialog: ({ event, actionType, pendingChanges, onConfirm }) => {
      set({
        isOpen: true,
        event,
        actionType,
        pendingChanges: pendingChanges || null,
        onConfirmCallback: onConfirm,
      });
    },

    confirmChoice: (choice) => {
      const { onConfirmCallback } = get();

      // Execute the callback if it exists
      if (onConfirmCallback) {
        onConfirmCallback(choice);
      }

      // Close the dialog
      set({
        isOpen: false,
        event: null,
        actionType: null,
        pendingChanges: null,
        onConfirmCallback: null,
      });
    },

    closeDialog: () => {
      set({
        isOpen: false,
        event: null,
        actionType: null,
        pendingChanges: null,
        onConfirmCallback: null,
      });
    },
  }),
);
