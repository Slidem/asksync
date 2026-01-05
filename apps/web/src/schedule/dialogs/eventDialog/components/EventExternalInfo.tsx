"use client";

import React from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

const SOURCE_CONFIG: Record<
  string,
  { label: string; icon: string; bgClass: string; textClass: string }
> = {
  google: {
    label: "Google Calendar",
    icon: "G",
    bgClass: "bg-red-100",
    textClass: "text-red-600",
  },
  outlook: {
    label: "Outlook Calendar",
    icon: "O",
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
  },
};

export const EventExternalInfo = React.memo(() => {
  const { source, googleEmail } = useEventDialogStore(
    useShallow((state) => ({
      source: state.eventMetadata.source,
      googleEmail: state.eventMetadata.googleEmail,
    })),
  );

  // Compute isExternalEvent directly from source for proper reactivity
  const isExternalEvent = source !== "asksync";

  if (!isExternalEvent) {
    return null;
  }

  const config = SOURCE_CONFIG[source] || {
    label: source,
    icon: "?",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <div
        className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${config.bgClass}`}
      >
        <span className={`text-sm font-semibold ${config.textClass}`}>
          {config.icon}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{config.label}</span>
          {googleEmail && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground truncate">
                {googleEmail}
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Synced event. You can modify tags, checklists, and permissions.
        </p>
      </div>
    </div>
  );
});

EventExternalInfo.displayName = "EventExternalInfo";
