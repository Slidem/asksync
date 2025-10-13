"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { CalendarEvent } from "@/schedule/types";
import { EventAllDayToggle } from "./fields/EventAllDayToggle";
import { EventColorPicker } from "./fields/EventColorPicker";
import { EventDateTimeFields } from "./fields/EventDateTimeFields";
import { EventDescriptionField } from "./fields/EventDescriptionField";
import { EventDialogFooter } from "./EventDialogFooter";
import { EventDialogHeader } from "./EventDialogHeader";
import { EventExternalInfo } from "./fields/EventExternalInfo";
import { EventLocationField } from "./fields/EventLocationField";
import { EventRecurrenceFields } from "./fields/EventRecurrenceFields";
import { EventTagSelector } from "./fields/EventTagSelector";
// Import field components
import { EventTitleField } from "./fields/EventTitleField";
import React from "react";
import { SectionDivider } from "./utils/SectionDivider";
import type { Tag } from "@asksync/shared";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";

interface EventDialogContainerProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  availableTags?: Tag[];
}

export const EventDialogContainer = React.memo<EventDialogContainerProps>(
  ({ event, isOpen, onClose, onSave, onDelete, availableTags = [] }) => {
    const { loadEvent, reset, validateAndGetEvent, error, eventId } =
      useEventDialogStore();

    // Load event data when dialog opens or event changes
    React.useEffect(() => {
      if (isOpen) {
        loadEvent(event);
      }
    }, [isOpen, event, loadEvent]);

    const handleClose = React.useCallback(() => {
      reset();
      onClose();
    }, [reset, onClose]);

    const handleSave = React.useCallback(() => {
      const result = validateAndGetEvent();
      if (result.event) {
        onSave(result.event);
      }
      // Error is already set in the store by validateAndGetEvent
    }, [validateAndGetEvent, onSave]);

    const handleDelete = React.useCallback(() => {
      if (eventId) {
        onDelete(eventId);
      }
    }, [eventId, onDelete]);

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!open) {
          handleClose();
        }
      },
      [handleClose],
    );

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <EventDialogHeader />

          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <EventTitleField />
            <EventDescriptionField />
            <EventLocationField />

            <SectionDivider />

            <EventDateTimeFields />
            <EventAllDayToggle />
            <EventRecurrenceFields />

            <SectionDivider />

            <EventTagSelector availableTags={availableTags} />

            <SectionDivider />

            <EventExternalInfo />
            <EventColorPicker />
          </div>

          <EventDialogFooter
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  },
);

EventDialogContainer.displayName = "EventDialogContainer";
