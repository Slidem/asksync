"use client";

import { EventTagSelector } from "../EventTagSelector";
import React from "react";

export const EventTagsTab = React.memo(() => {
  return (
    <div className="space-y-4">
      <EventTagSelector />
    </div>
  );
});

EventTagsTab.displayName = "EventTagsTab";
