"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventLocationField = React.memo(() => {
  const { location, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      location: state.formFields.location,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFields({ location: e.target.value });
    },
    [updateFields],
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
