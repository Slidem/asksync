"use client";

import { JSX } from "react";
import { Calendar1 } from "lucide-react";
import { EventCalendar } from "@/schedule/components/EventCalendar";
import { EventDialog } from "@/schedule";
import { IntegrationsDialog } from "@/schedule/dialogs/integrationsDialog/IntegrationsDialog";
import { RecurringDialog } from "@/schedule/dialogs/recurringDialog/components/RecurringDialog";

export default function SchedulePage(): JSX.Element {
  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar1 className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            </div>

            {/* Integrations Button */}
            <IntegrationsDialog />
          </div>

          <p className="text-muted-foreground max-w-2xl">
            Manage your schedule and organize your notifications. Integrate the
            calendar with your favorite tools for bi-directional sync.
          </p>
        </div>
        <EventCalendar />
        <EventDialog />
        <RecurringDialog />
      </div>
    </>
  );
}
