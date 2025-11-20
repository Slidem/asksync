import {
  addHoursToDate,
  calendarEventToCreateTimeblock,
  calendarEventToUpdateTimeblock,
} from "@/schedule/utils";

import { CalendarEvent } from "@/schedule/types";
import { api } from "@convex/api";
import { getDefaultCreateResourceGrants } from "@/components/permissions/types";
import { toTimeblockId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useCallback } from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useMutation } from "convex/react";
import { useSyncPermissions } from "@/components/permissions/hooks";
import { useUser } from "@clerk/nextjs";

export const useOpenCreateEventDialog = () => {
  const openDialog = useEventDialogStore((state) => state.open);
  const { user } = useUser();
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);
  const isReadOnly = selectedUserId !== null;

  return useCallback(
    ({ start, end }: { start: Date; end?: Date }) => {
      if (isReadOnly) {
        return;
      }
      // Snap start time to 15-minute intervals if not already snapped
      const minutes = start.getMinutes();
      const remainder = minutes % 15;
      if (remainder !== 0) {
        if (remainder < 7.5) {
          // Round down to nearest 15 min
          start.setMinutes(minutes - remainder);
        } else {
          // Round up to nearest 15 min
          start.setMinutes(minutes + (15 - remainder));
        }
        start.setSeconds(0);
        start.setMilliseconds(0);
      }

      // Use provided end time or default to 1 hour
      const eventEnd = end || addHoursToDate(start, 1);

      const newEvent: CalendarEvent = {
        id: "",
        title: "",
        start: start,
        end: eventEnd,
        allDay: false,
        permissions: getDefaultCreateResourceGrants(user?.id || ""),
      };

      openDialog(newEvent);
    },
    [isReadOnly, openDialog, user?.id],
  );
};

export const useOpenCreateEventDialogAtNow = () => {
  const openCreateEventDialog = useOpenCreateEventDialog();

  return useCallback(() => {
    const now = new Date();
    const end = addHoursToDate(now, 1);
    openCreateEventDialog({ start: now, end });
  }, [openCreateEventDialog]);
};

export const useSelectEventInDialog = () => {
  const openDialog = useEventDialogStore((state) => state.open);
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);

  return useCallback(
    (event: CalendarEvent) => {
      // Don't open dialog when viewing another user's calendar
      if (selectedUserId !== null) {
        return;
      }
      openDialog(event);
    },
    [openDialog, selectedUserId],
  );
};

export const useCreateEvent = () => {
  const createTimeblockMutation = useMutation(
    api.timeblocks.mutations.createTimeblock,
  );

  const validateAndGetEvent = useEventDialogStore(
    (state) => state.validateAndGetEvent,
  );

  const permissions = useEventDialogStore(
    (state) => state.formFields.permissions,
  );

  const syncPermissions = useSyncPermissions();

  const close = useEventDialogStore((state) => state.close);

  return async () => {
    try {
      const { event: newEvent, error } = validateAndGetEvent();
      if (error) {
        toast.error(error);
        return;
      }
      if (!newEvent) {
        throw new Error("No event to create");
      }
      const timeblockData = calendarEventToCreateTimeblock(newEvent);

      const timeblockId = await createTimeblockMutation(timeblockData);

      await syncPermissions("timeblocks", timeblockId, [], permissions || []);

      toast.success("Timeblock created successfully");
      close();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create timeblock",
      );
    }
  };
};

export const useUpdateEvent = () => {
  const updateTimeblockMutation = useMutation(
    api.timeblocks.mutations.updateTimeblock,
  );
  const syncPermissions = useSyncPermissions();
  const validateAndGetEvent = useEventDialogStore(
    (state) => state.validateAndGetEvent,
  );
  const close = useEventDialogStore((state) => state.close);

  return async () => {
    const {
      event: updatedEvent,
      permissions: updatedPermissions,
      initialPermissions: currentPermissions,
      error,
    } = validateAndGetEvent();
    if (error) {
      toast.error(error);
      close();
      return;
    }

    if (!updatedEvent) {
      throw new Error("No event to update");
    }

    try {
      // Update timeblock first
      const updateData = calendarEventToUpdateTimeblock(updatedEvent);
      await updateTimeblockMutation({
        id: toTimeblockId(updatedEvent.id),
        ...updateData,
      });

      // Then sync permissions
      if (updatedPermissions) {
        await syncPermissions(
          "timeblocks",
          updatedEvent.id,
          currentPermissions,
          updatedPermissions,
        );
      }

      toast.success("Timeblock updated successfully");
      close();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update timeblock",
      );
    }
  };
};

export const useDeleteEvent = () => {
  const deleteTimeblockMutation = useMutation(
    api.timeblocks.mutations.deleteTimeblock,
  );

  const eventId = useEventDialogStore((state) => state.eventMetadata.eventId);
  const close = useEventDialogStore((state) => state.close);

  return async () => {
    if (!eventId) {
      throw new Error("No event to delete");
    }

    await deleteTimeblockMutation({
      id: toTimeblockId(eventId),
    });
    toast.success("Timeblock deleted successfully");
    close();
  };
};
