"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React from "react";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventAllDayToggle = React.memo(() => {
  const { allDay, setAllDay, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      allDay: state.allDay,
      setAllDay: state.setAllDay,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const handleChange = React.useCallback(
    (checked: boolean | "indeterminate") => {
      setAllDay(checked === true);
    },
    [setAllDay],
  );

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="all-day"
        checked={allDay}
        onCheckedChange={handleChange}
        disabled={canOnlyEditTags}
      />
      <Label htmlFor="all-day">All day</Label>
    </div>
  );
});

EventAllDayToggle.displayName = "EventAllDayToggle";
