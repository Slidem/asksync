import {
  addHoursToDate,
  calendarEventToCreateTimeblock,
  calendarEventToUpdateTimeblock,
} from "@/schedule/utils";

import { CalendarEvent } from "@/schedule/types";
import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useCallback } from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useMutation } from "convex/react";

export const useOpenCreateEventDialog = () => {
  const openDialog = useEventDialogStore((state) => state.open);
  return useCallback(
    ({ start, end }: { start: Date; end?: Date }) => {
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
      };

      openDialog(newEvent);
    },
    [openDialog],
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
  return useCallback(
    (event: CalendarEvent) => {
      openDialog(event);
    },
    [openDialog],
  );
};

export const useCreateEvent = () => {
  const createTimeblockMutation = useMutation(
    api.timeblocks.mutations.createTimeblock,
  );

  const validateAndGetEvent = useEventDialogStore(
    (state) => state.validateAndGetEvent,
  );

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
      await createTimeblockMutation(timeblockData);
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

  const validateAndGetEvent = useEventDialogStore(
    (state) => state.validateAndGetEvent,
  );

  const close = useEventDialogStore((state) => state.close);

  return async () => {
    const { event: updatedEvent, error } = validateAndGetEvent();
    if (error) {
      toast.error(error);
      close();
      return;
    }

    if (!updatedEvent) {
      throw new Error("No event to update");
    }

    const updateData = calendarEventToUpdateTimeblock(updatedEvent);
    await updateTimeblockMutation({
      id: toTimeblockId(updatedEvent.id),
      ...updateData,
    });
    toast.success("Timeblock updated successfully");
    close();
  };
};

export const useDeleteEvent = () => {
  const deleteTimeblockMutation = useMutation(
    api.timeblocks.mutations.deleteTimeblock,
  );

  const eventId = useEventDialogStore((state) => state.eventMetadata.eventId);

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
