"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRecurringDialog } from "@/schedule/stores";

// Re-export types for backward compatibility
export type {
  RecurringActionType,
  RecurringChoiceType,
} from "@/schedule/stores";

export function RecurringEventConfirmDialog() {
  const { isOpen, event, actionType, confirmChoice, closeDialog } =
    useRecurringDialog();

  if (!event) return null;

  const eventDate = format(event.start, "MMMM d, yyyy");
  const eventTime = format(event.start, "h:mm a");
  const actionText = actionType === "update" ? "edit" : "delete";

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
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
            onClick={() => confirmChoice("this")}
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
            onClick={() => confirmChoice("all")}
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
          <Button variant="ghost" size="sm" onClick={closeDialog}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
