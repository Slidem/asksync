"use client";

import React, { useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
} from "@/schedule/dialogs/eventDialog/eventDialogService";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { RiDeleteBinLine } from "@remixicon/react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useRecurringDialogStore } from "@/schedule/dialogs/recurringDialog/recurringDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDialogFooter = React.memo(() => {
  const {
    eventId,
    source,
    canDelete,
    validateAndGetEvent,
    close,
    previousRecurrenceRule,
    error,
  } = useEventDialogStore(
    useShallow((state) => ({
      eventId: state.eventMetadata.eventId,
      source: state.eventMetadata.source,
      canDelete: state.eventMetadata.canDelete,
      validateAndGetEvent: state.validateAndGetEvent,
      close: state.close,
      previousRecurrenceRule: state.eventToUpdate?.recurrenceRule,
      error: state.formFields.error,
    })),
  );

  const isExternalEvent = source !== "asksync";
  const canDeleteEvent = canDelete !== false && !isExternalEvent;

  const tabsWithErrors = error ? [1] : [];

  const previousStartDate = useEventDialogStore(
    (state) => state.eventToUpdate?.start,
  );

  const previousEndDate = useEventDialogStore(
    (state) => state.eventToUpdate?.end,
  );

  const openRecurringDialog = useRecurringDialogStore((state) => state.open);

  const updateEvent = useUpdateEvent();

  const deleteEvent = useDeleteEvent();

  const createEvent = useCreateEvent();

  const handleDelete = useCallback(async () => {
    const { error, event } = validateAndGetEvent();
    if (error) {
      return;
    }
    if (!event) {
      throw new Error("No event to update");
    }

    if (event.recurrenceRule) {
      openRecurringDialog("delete", event);
    } else {
      await deleteEvent();
      close();
    }
  }, [close, deleteEvent, openRecurringDialog, validateAndGetEvent]);

  const handleSave = useCallback(async () => {
    const { event, error } = validateAndGetEvent();

    if (error) {
      return;
    }
    if (!event) {
      throw new Error("No event to update");
    }

    if (!event.id) {
      await createEvent();
      return;
    }

    const addingRecurrenceRule =
      !previousRecurrenceRule && event.recurrenceRule;

    const removingRecurrenceRule =
      previousRecurrenceRule && !event.recurrenceRule;

    const changingStart = previousStartDate
      ? event.start.getTime() !== previousStartDate.getTime()
      : false;

    const changingEnd = previousEndDate
      ? event.end.getTime() !== previousEndDate.getTime()
      : false;

    const changingDates = changingStart || changingEnd;

    if (addingRecurrenceRule || removingRecurrenceRule || !changingDates) {
      await updateEvent();
      return;
    }

    openRecurringDialog("update", event);
  }, [
    createEvent,
    openRecurringDialog,
    previousEndDate,
    previousRecurrenceRule,
    previousStartDate,
    updateEvent,
    validateAndGetEvent,
  ]);

  const hasErrors = tabsWithErrors.length > 0;
  const tabNames = ["Details", "Date & Time", "Tags", "Permissions"];

  const getTooltipMessage = () => {
    if (!hasErrors || !error) return null;
    const errorTabIndex = tabsWithErrors[0];
    if (errorTabIndex !== undefined) {
      return `Please fix errors in ${tabNames[errorTabIndex]}: ${error}`;
    }
    return null;
  };

  const saveButton = (
    <Button onClick={handleSave} disabled={hasErrors}>
      {isExternalEvent ? "Update Tags" : "Save"}
    </Button>
  );

  return (
    <DialogFooter className="flex-row sm:justify-between">
      {eventId && canDeleteEvent && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete event"
        >
          <RiDeleteBinLine size={16} aria-hidden="true" />
        </Button>
      )}
      <div className="flex flex-1 justify-end gap-2">
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
        {hasErrors ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{saveButton}</TooltipTrigger>
              <TooltipContent>
                <p>{getTooltipMessage()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          saveButton
        )}
      </div>
    </DialogFooter>
  );
});

EventDialogFooter.displayName = "EventDialogFooter";
