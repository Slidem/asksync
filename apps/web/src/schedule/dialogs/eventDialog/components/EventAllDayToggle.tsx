"use client";

import React, { useCallback } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventAllDayToggle = React.memo(() => {
  const { allDay, source } = useEventDialogStore(
    useShallow((state) => ({
      allDay: state.formFields.allDay,
      source: state.eventMetadata.source,
    })),
  );

  const isExternalEvent = source !== "asksync";

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const handleChange = useCallback(
    (checked: boolean | "indeterminate") => {
      updateFields({ allDay: checked === true });
    },
    [updateFields],
  );

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="all-day"
        checked={allDay}
        onCheckedChange={handleChange}
        disabled={isExternalEvent}
      />
      <Label htmlFor="all-day">All day</Label>
    </div>
  );
});

EventAllDayToggle.displayName = "EventAllDayToggle";
