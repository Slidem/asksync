import { CalendarEvent } from "@/schedule/types";
import { useAskQuestionDialogStore } from "./askQuestionDialogStore";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useCallback } from "react";

export const useOpenAskQuestionDialog = () => {
  const openDialog = useAskQuestionDialogStore((state) => state.openDialog);
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);

  return useCallback(
    (event: CalendarEvent) => {
      if (selectedUserId === null) {
        return;
      }

      const tagIds = event.tagIds || [];

      openDialog({
        timeblockId: event.id,
        assigneeUserId: selectedUserId,
        tagIds,
      });
    },
    [openDialog, selectedUserId],
  );
};
