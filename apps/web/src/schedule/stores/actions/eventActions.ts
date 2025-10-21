import { CalendarEvent } from "@/schedule/types";
import { calendarActions } from "./calendarActions";
import { isRecurringInstance } from "@/schedule/utils";
import { useEventDialogStore } from "../eventDialogStore";
import { useRecurringDialogStore } from "../recurringDialogStore";

/**
 * Event management actions
 * Abstracted functions for event operations
 */
export const eventActions = {
  create: (initialData?: Partial<CalendarEvent>) => {
    const store = useEventDialogStore.getState();
    if (initialData) {
      store.loadEvent(initialData as CalendarEvent);
    } else {
      store.reset();
    }
    // Open the dialog through calendar store
    calendarActions.dialog.open();
  },

  edit: (event: CalendarEvent) => {
    const store = useEventDialogStore.getState();
    store.loadEvent(event);
    calendarActions.dialog.open(event.id);
  },

  delete: async (
    event: CalendarEvent,
    onConfirm: (choice: "this" | "all") => void,
  ) => {
    if (event.isRecurring || isRecurringInstance(event.id)) {
      // Open recurring confirmation dialog
      useRecurringDialogStore.getState().openDialog({
        event,
        actionType: "delete",
        onConfirm,
      });
    } else {
      // Direct deletion for non-recurring events
      onConfirm("this");
    }
  },

  update: async (
    event: CalendarEvent,
    changes: Partial<CalendarEvent>,
    onConfirm: (choice: "this" | "all") => void,
  ) => {
    if (event.isRecurring || isRecurringInstance(event.id)) {
      // Open recurring confirmation dialog
      useRecurringDialogStore.getState().openDialog({
        event,
        actionType: "update",
        pendingChanges: changes,
        onConfirm,
      });
    } else {
      // Direct update for non-recurring events
      onConfirm("this");
    }
  },

  // Form-specific actions
  form: {
    setTitle: (title: string) => useEventDialogStore.getState().setTitle(title),
    setDescription: (description: string) =>
      useEventDialogStore.getState().setDescription(description),
    setDates: (startDate: Date, endDate: Date) => {
      const store = useEventDialogStore.getState();
      store.setStartDate(startDate);
      store.setEndDate(endDate);
    },
    setAllDay: (allDay: boolean) =>
      useEventDialogStore.getState().setAllDay(allDay),
    toggleTag: (tagId: string) =>
      useEventDialogStore.getState().toggleTagId(tagId),
    validate: () => useEventDialogStore.getState().validateAndGetEvent(),
    reset: () => useEventDialogStore.getState().reset(),
  },
};
