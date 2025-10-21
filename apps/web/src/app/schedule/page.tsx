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
  RecurringActionType,
  RecurringChoiceType,
  RecurringEventConfirmDialog,
} from "@/schedule/components/RecurringEventConfirmDialog";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  calendarEventToCreateTimeblock,
  calendarEventToUpdateTimeblock,
  expandRecurringEvents,
  getBaseEventId,
  isRecurringInstance,
} from "@/schedule/utils";
import { docToTimeblock, toTimeblockId } from "@/lib/convexTypes";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/schedule/types";
import { EventCalendar } from "@/schedule/components/EventCalendar";
import { Timeblock } from "@asksync/shared";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useTags } from "@/tags/hooks/queries";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<
    "month" | "week" | "day" | "agenda"
  >("week");

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    event: CalendarEvent | null;
    actionType: RecurringActionType;
    pendingAction: (() => Promise<void>) | null;
  }>({
    isOpen: false,
    event: null,
    actionType: "update",
    pendingAction: null,
  });

  const rawTimeblocks =
    useQuery(api.timeblocks.queries.listTimeblocks, {}) || [];

  const { tags } = useTags({});
  const timeblocks: Timeblock[] = rawTimeblocks.map(docToTimeblock);

  // Calculate view date range for recurring event expansion
  const viewDateRange = useMemo(() => {
    switch (currentView) {
      case "month": {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return {
          start: startOfWeek(monthStart, { weekStartsOn: 0 }),
          end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
        };
      }
      case "week": {
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        };
      }
      case "day": {
        return {
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
          ),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            23,
            59,
            59,
          ),
        };
      }
      case "agenda": {
        return {
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
          ),
          end: addDays(currentDate, 14),
        };
      }
      default:
        return {
          start: currentDate,
          end: currentDate,
        };
    }
  }, [currentDate, currentView]);

  // Expand recurring events for the current view range
  const events: CalendarEvent[] = useMemo(() => {
    return expandRecurringEvents(
      timeblocks,
      viewDateRange.start,
      viewDateRange.end,
    );
  }, [timeblocks, viewDateRange.start, viewDateRange.end]);

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
    console.log("Handling update for", updatedEvent);
    try {
      // Only update if this is an existing timeblock with a valid ID
      if (!updatedEvent.id || updatedEvent.id === "") {
        // This is actually a new event, handle as create
        return handleEventAdd(updatedEvent);
      }

      // Check if this is a recurring event instance
      if (isRecurringInstance(updatedEvent.id)) {
        // Show confirmation dialog for recurring events
        setConfirmDialog({
          isOpen: true,
          event: updatedEvent,
          actionType: "update",
          pendingAction: () => performEventUpdate(updatedEvent),
        });
      } else {
        // Regular single event update
        await performEventUpdate(updatedEvent);
      }
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
      // Check if this is a recurring event instance
      if (isRecurringInstance(eventId)) {
        // Find the event for the confirmation dialog
        const event = events.find((e) => e.id === eventId);
        if (event) {
          // Show confirmation dialog for recurring events
          setConfirmDialog({
            isOpen: true,
            event,
            actionType: "delete",
            pendingAction: () => performEventDelete(eventId),
          });
        }
      } else {
        // Regular single event deletion
        await performEventDelete(eventId);
      }
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

  // Handle calendar navigation changes
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: "month" | "week" | "day" | "agenda") => {
    setCurrentView(newView);
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
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          className="h-full"
        />
      </div>

      <RecurringEventConfirmDialog />
    </div>
  );
}
