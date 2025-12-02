"use client";

import { EventAllDayToggle } from "../EventAllDayToggle";
import { EventDateTimeFields } from "../EventDateTimeFields";
import { EventRecurrenceFields } from "../EventRecurrenceFields";
import React from "react";

export const EventDateTimeTab = React.memo(() => {
  return (
    <div className="space-y-4">
      <EventDateTimeFields />
      <EventAllDayToggle />
      <EventRecurrenceFields />
    </div>
  );
});

EventDateTimeTab.displayName = "EventDateTimeTab";
