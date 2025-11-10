"use client";

import React from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventExternalInfo = React.memo(() => {
  const { isExternalEvent, source } = useEventDialogStore(
    useShallow((state) => ({
      isExternalEvent: state.isExternalEvent,
      source: state.eventMetadata.source,
    })),
  );

  if (!isExternalEvent) {
    return null;
  }

  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="font-medium">External Event</span>
        <span className="text-muted-foreground">from {source}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        This event is synced from an external calendar. You can only modify tag
        associations.
      </p>
    </div>
  );
});

EventExternalInfo.displayName = "EventExternalInfo";
