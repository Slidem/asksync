"use client";

import { EventColorPicker } from "../EventColorPicker";
import { EventDescriptionField } from "../EventDescriptionField";
import { EventLocationField } from "../EventLocationField";
import { EventTitleField } from "../EventTitleField";
import React from "react";

export const EventDetailsTab = React.memo(() => {
  return (
    <div className="space-y-4">
      <EventTitleField />
      <EventDescriptionField />
      <EventLocationField />
      <EventColorPicker />
    </div>
  );
});

EventDetailsTab.displayName = "EventDetailsTab";
