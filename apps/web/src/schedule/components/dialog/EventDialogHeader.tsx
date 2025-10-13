"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React from "react";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";

export const EventDialogHeader = React.memo(() => {
  const eventId = useEventDialogStore((state) => state.eventId);

  return (
    <DialogHeader>
      <DialogTitle>{eventId ? "Edit Event" : "Create Event"}</DialogTitle>
      <DialogDescription className="sr-only">
        {eventId
          ? "Edit the details of this event"
          : "Add a new event to your calendar"}
      </DialogDescription>
    </DialogHeader>
  );
});

EventDialogHeader.displayName = "EventDialogHeader";
