"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventTitleField = React.memo(() => {
  const { title, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      title: state.formFields.title,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFields({ title: e.target.value });
    },
    [updateFields],
  );

  return (
    <div className="*:not-first:mt-1.5">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={title}
        onChange={handleChange}
        disabled={canOnlyEditTags}
      />
    </div>
  );
});

EventTitleField.displayName = "EventTitleField";
