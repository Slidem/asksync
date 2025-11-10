"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteRecurringEvent,
  useUpdateRecurringEvent,
} from "@/schedule/dialogs/recurringDialog/recurringDialogService";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useCallback } from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useRecurringDialogStore } from "@/schedule/dialogs/recurringDialog/recurringDialogStore";
import { useShallow } from "zustand/react/shallow";

export const RecurringDialog = () => {
  const {
    isOpen,
    event,
    actionType,
    closeRecurrenceDialog: close,
  } = useRecurringDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      event: state.event,
      actionType: state.actionType,
      closeRecurrenceDialog: state.close,
    })),
  );
  const closeEventDialog = useEventDialogStore((state) => state.close);

  const updateRecurringEvent = useUpdateRecurringEvent();
  const deleteRecurringEvent = useDeleteRecurringEvent();

  const handleConfirm = useCallback(
    (scope: "this" | "all") => {
      if (actionType === "update") {
        updateRecurringEvent(scope);
      } else if (actionType === "delete") {
        deleteRecurringEvent(scope);
      }
      close();
      closeEventDialog();
    },
    [
      actionType,
      close,
      closeEventDialog,
      updateRecurringEvent,
      deleteRecurringEvent,
    ],
  );

  const handleConfirmThis = useCallback(async () => {
    handleConfirm("this");
  }, [handleConfirm]);

  const handleConfirmAll = useCallback(async () => {
    handleConfirm("all");
  }, [handleConfirm]);

  if (!event || !actionType) {
    return null;
  }

  const eventDate = format(event.start, "MMMM d, yyyy");
  const eventTime = format(event.start, "h:mm a");
  const actionText = actionType === "update" ? "edit" : "delete";

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-[95vw] sm:max-w-[380px] mx-4">
        <DialogHeader>
          <DialogTitle className="text-base">
            {actionType === "update"
              ? "Edit recurring event"
              : "Delete recurring event"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            You're about to {actionText} "{event.title}" on {eventDate} at{" "}
            {eventTime}. This is a recurring event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-2.5 text-left"
            onClick={handleConfirmThis}
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium text-sm">This event only</span>
              <span className="text-xs text-muted-foreground">
                Only this occurrence
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto p-2.5 text-left"
            onClick={handleConfirmAll}
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="font-medium text-sm">
                All events in the series
              </span>
              <span className="text-xs text-muted-foreground">
                All occurrences of this event
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" size="sm" onClick={close}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
