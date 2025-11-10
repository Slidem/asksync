"use client";

import { Label } from "@/components/ui/label";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDescriptionField = React.memo(() => {
  const { description, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      description: state.formFields.description,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateFields({ description: e.target.value });
    },
    [updateFields],
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
