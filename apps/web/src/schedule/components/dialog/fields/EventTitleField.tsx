"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventTitleField = React.memo(() => {
  const { title, setTitle, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      title: state.title,
      setTitle: state.setTitle,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [setTitle],
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
