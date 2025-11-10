import { CalendarEvent } from "@/schedule/types";
import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useRecurringDialogStore } from "@/schedule/dialogs/recurringDialog/recurringDialogStore";

export const useUpdateEventDates = () => {
  const openRecurringDialog = useRecurringDialogStore((state) => state.open);

  const updateTimeblockMutation = useMutation(
    api.timeblocks.mutations.updateTimeblock,
  );

  return async ({
    event,
    startTime,
    endTime,
  }: {
    event: CalendarEvent;
    startTime: Date;
    endTime: Date;
  }) => {
    if (event.recurrenceRule) {
      openRecurringDialog("update", {
        ...event,
        start: startTime,
        end: endTime,
      });
      return;
    }

    const { id } = event;

    await updateTimeblockMutation({
      id: toTimeblockId(id),
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
    });

    toast.success("Timeblock updated successfully");
  };
};
