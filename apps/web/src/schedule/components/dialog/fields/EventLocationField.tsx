"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventLocationField = React.memo(() => {
  const { location, setLocation, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      location: state.location,
      setLocation: state.setLocation,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocation(e.target.value);
    },
    [setLocation],
  );

  return (
    <div className="*:not-first:mt-1.5">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        value={location}
        onChange={handleChange}
        disabled={canOnlyEditTags}
      />
    </div>
  );
});

EventLocationField.displayName = "EventLocationField";
