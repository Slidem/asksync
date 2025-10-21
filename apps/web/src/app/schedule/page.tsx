"use client";

import { Calendar1, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RecurringChoiceType,
  RecurringEventConfirmDialog,
} from "@/schedule/components/RecurringEventConfirmDialog";
import {
  calendarEventToCreateTimeblock,
  calendarEventToUpdateTimeblock,
  expandRecurringEvents,
  getBaseEventId,
  isRecurringInstance,
} from "@/schedule/utils";
import { docToTimeblock, toTimeblockId } from "@/lib/convexTypes";
import { eventActions, useCalendarStore } from "@/schedule/stores";
import { useMutation, useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/schedule/types";
import { EventCalendar } from "@/schedule/components/EventCalendar";
import { Timeblock } from "@asksync/shared";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useMemo } from "react";
import { useTags } from "@/tags/hooks/queries";

export default function SchedulePage() {
  const rawTimeblocks =
    useQuery(api.timeblocks.queries.listTimeblocks, {}) || [];

  const { tags } = useTags({});
  const timeblocks: Timeblock[] = rawTimeblocks.map(docToTimeblock);
  const getDateRange = useCalendarStore((state) => state.getDateRange);

  // Expand recurring events for the current view range
  const events: CalendarEvent[] = useMemo(() => {
    const range = getDateRange();
    return expandRecurringEvents(timeblocks, range.start, range.end);
  }, [timeblocks, getDateRange]);

  // Mutations
  const createTimeblockMutation = useMutation(
    api.timeblocks.mutations.createTimeblock,
  );

  const updateTimeblockMutation = useMutation(
    api.timeblocks.mutations.updateTimeblock,
  );

  const deleteTimeblockMutation = useMutation(
    api.timeblocks.mutations.deleteTimeblock,
  );

  const addExceptionMutation = useMutation(
    api.timeblocks.mutations.addTimeblockException,
  );

  // Helper function to get UTC midnight timestamp for a date
  const getUTCMidnight = (date: Date): number => {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate.getTime();
  };

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const timeblockData = calendarEventToCreateTimeblock(event);
      await createTimeblockMutation(timeblockData);
      toast.success("Timeblock created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create timeblock",
      );
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      // Only update if this is an existing timeblock with a valid ID
      if (!updatedEvent.id || updatedEvent.id === "") {
        // This is actually a new event, handle as create
        return handleEventAdd(updatedEvent);
      }

      // Use eventActions - it handles recurring check automatically
      await eventActions.update(updatedEvent, {}, async (choice) => {
        await performEventUpdate(updatedEvent, choice);
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update timeblock",
      );
    }
  };

  const performEventUpdate = async (
    updatedEvent: CalendarEvent,
    choice?: RecurringChoiceType,
  ) => {
    if (isRecurringInstance(updatedEvent.id) && choice) {
      // Handle recurring event update based on user choice
      const baseEventId = getBaseEventId(updatedEvent.id);

      switch (choice) {
        case "this": {
          // Single instance edit: create exception + new standalone timeblock
          const instanceDate = new Date(updatedEvent.start);
          const exceptionDate = getUTCMidnight(instanceDate);
          // Add exception to the parent recurring timeblock
          try {
            await addExceptionMutation({
              timeblockId: toTimeblockId(baseEventId),
              exceptionDate,
            });
          } catch (error) {
            console.error("  Error adding exception:", error);
            throw error;
          }

          const standaloneData = calendarEventToCreateTimeblock(updatedEvent);
          // Override recurrence settings - this should be a single event, not recurring
          standaloneData.isRecurring = false;
          standaloneData.recurrenceRule = undefined;
          await createTimeblockMutation(standaloneData);
          toast.success("Single timeblock instance updated successfully");
          break;
        }
        case "all": {
          // Update the entire recurring series
          const updateData = calendarEventToUpdateTimeblock(updatedEvent);
          await updateTimeblockMutation({
            id: toTimeblockId(baseEventId),
            ...updateData,
          });
          toast.success("Recurring timeblock updated successfully");
          break;
        }
      }
    } else {
      console.log("Performing regular update for", updatedEvent.id);
      // Regular single event update
      const updateData = calendarEventToUpdateTimeblock(updatedEvent);
      await updateTimeblockMutation({
        id: toTimeblockId(updatedEvent.id),
        ...updateData,
      });
      toast.success("Timeblock updated successfully");
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      // Find the event
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      // Use eventActions - it handles recurring check automatically
      await eventActions.delete(event, async (choice) => {
        await performEventDelete(eventId, choice);
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete timeblock",
      );
    }
  };

  const performEventDelete = async (
    eventId: string,
    choice?: RecurringChoiceType,
  ) => {
    if (isRecurringInstance(eventId) && choice) {
      // Handle recurring event deletion based on user choice
      const baseEventId = getBaseEventId(eventId);

      switch (choice) {
        case "this": {
          // Single instance deletion: just add exception to hide this occurrence
          const event = events.find((e) => e.id === eventId);
          if (event) {
            const instanceDate = new Date(event.start);
            const exceptionDate = getUTCMidnight(instanceDate);

            await addExceptionMutation({
              timeblockId: toTimeblockId(baseEventId),
              exceptionDate,
            });

            toast.success("Single timeblock instance deleted successfully");
          }
          break;
        }
        case "all": {
          // Delete the entire recurring series
          await deleteTimeblockMutation({ id: toTimeblockId(baseEventId) });
          toast.success("Recurring timeblock deleted successfully");
          break;
        }
      }
    } else {
      // Regular single event deletion
      await deleteTimeblockMutation({ id: toTimeblockId(eventId) });
      toast.success("Timeblock deleted successfully");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar1 className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          </div>

          {/* Integrations Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Integrations
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Calendar Integrations</DialogTitle>
                <DialogDescription>
                  Connect your favorite calendar services for bi-directional
                  sync.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-red-600">
                          G
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Gmail Calendar</h4>
                        <p className="text-sm text-muted-foreground">
                          Sync with Google Calendar
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          O
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Outlook</h4>
                        <p className="text-sm text-muted-foreground">
                          Sync with Microsoft Outlook
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-muted-foreground max-w-2xl">
          Manage your schedule and organize your notifications. Integrate the
          calendar with your favourite tools for bi-directional sync.
        </p>
      </div>

      <div className="min-h-[600px]">
        <EventCalendar
          events={events}
          initialView="week"
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          availableTags={tags}
          className="h-full"
        />
      </div>

      <RecurringEventConfirmDialog />
    </div>
  );
}
