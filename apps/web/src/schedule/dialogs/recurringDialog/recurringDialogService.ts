import {
  calendarEventToCreateTimeblock,
  calendarEventToUpdateTimeblock,
} from "@/schedule/utils";

import { api } from "@convex/api";
import { getUTCMidnight } from "@/schedule/utils";
import { toTimeblockId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useRecurringDialogStore } from "@/schedule/dialogs/recurringDialog/recurringDialogStore";
import { useSyncPermissions } from "@/components/permissions";

export const useUpdateRecurringEvent = () => {
  const updateTimeblockMutation = useMutation(
    api.timeblocks.mutations.updateTimeblock,
  );

  const addExceptionMutation = useMutation(
    api.timeblocks.mutations.addTimeblockException,
  );

  const createTimeblockMutation = useMutation(
    api.timeblocks.mutations.createTimeblock,
  );

  const event = useRecurringDialogStore((state) => state.event);

  const syncPermissions = useSyncPermissions();

  async function addExceptionToThisEventOnly() {
    const instanceDate = new Date(event!.start);
    const exceptionDate = getUTCMidnight(instanceDate);
    try {
      await addExceptionMutation({
        timeblockId: toTimeblockId(event!.id),
        exceptionDate,
      });
    } catch (error) {
      console.error("  Error adding exception:", error);
      throw error;
    }

    const standaloneData = calendarEventToCreateTimeblock(event!);
    standaloneData.recurrenceRule = undefined;
    const newEventId = await createTimeblockMutation(standaloneData);
    await syncPermissions(
      "timeblocks",
      newEventId,
      [],
      event?.permissions || [],
    );
    toast.success("Single timeblock instance updated successfully");
  }

  async function updateAllInstances() {
    const updateData = calendarEventToUpdateTimeblock(event!);
    await updateTimeblockMutation({
      id: toTimeblockId(event!.id),
      ...updateData,
    });
    toast.success("Recurring timeblock updated successfully");
  }

  return async (choice: "this" | "all") => {
    if (!event) {
      throw new Error("No event to update");
    }

    if (choice === "this") {
      await addExceptionToThisEventOnly();
    }

    if (choice === "all") {
      await updateAllInstances();
    }
  };
};

export const useDeleteRecurringEvent = () => {
  const deleteTimeblockMutation = useMutation(
    api.timeblocks.mutations.deleteTimeblock,
  );

  const addExceptionMutation = useMutation(
    api.timeblocks.mutations.addTimeblockException,
  );

  const event = useRecurringDialogStore((state) => state.event);

  return async (choice: "this" | "all") => {
    if (!event) {
      throw new Error("No event to delete");
    }

    if (choice === "this") {
      const instanceDate = new Date(event.start);
      const exceptionDate = getUTCMidnight(instanceDate);

      await addExceptionMutation({
        timeblockId: toTimeblockId(event.id),
        exceptionDate,
      });

      toast.success("Single timeblock instance deleted successfully");
    }

    if (choice === "all") {
      deleteTimeblockMutation({ id: toTimeblockId(event.id) });
      toast.success("Recurring timeblock deleted successfully");
    }
  };
};
