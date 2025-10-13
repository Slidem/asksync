"use client";

import { Label } from "@/components/ui/label";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDescriptionField = React.memo(() => {
  const { description, setDescription, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      description: state.description,
      setDescription: state.setDescription,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    [setDescription],
  );

  return (
    <div className="*:not-first:mt-1.5">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={description}
        onChange={handleChange}
        rows={3}
        disabled={canOnlyEditTags}
      />
    </div>
  );
});

EventDescriptionField.displayName = "EventDescriptionField";
