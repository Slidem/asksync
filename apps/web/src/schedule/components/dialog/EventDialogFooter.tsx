"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { RiDeleteBinLine } from "@remixicon/react";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

interface EventDialogFooterProps {
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EventDialogFooter = React.memo<EventDialogFooterProps>(
  ({ onSave, onDelete, onClose }) => {
    const { eventId, canDeleteEvent, canOnlyEditTags } = useEventDialogStore(
      useShallow((state) => ({
        eventId: state.eventId,
        canDeleteEvent: state.canDeleteEvent,
        canOnlyEditTags: state.canOnlyEditTags,
      })),
    );

    const handleSave = React.useCallback(() => {
      onSave();
    }, [onSave]);

    const handleDelete = React.useCallback(() => {
      onDelete();
    }, [onDelete]);

    const handleClose = React.useCallback(() => {
      onClose();
    }, [onClose]);

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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {canOnlyEditTags ? "Update Tags" : "Save"}
          </Button>
        </div>
      </DialogFooter>
    );
  },
);

EventDialogFooter.displayName = "EventDialogFooter";
