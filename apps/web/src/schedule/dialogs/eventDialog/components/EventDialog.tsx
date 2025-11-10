"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { EventAllDayToggle } from "@/schedule/dialogs/eventDialog/components/EventAllDayToggle";
import { EventColorPicker } from "@/schedule/dialogs/eventDialog/components/EventColorPicker";
import { EventDateTimeFields } from "@/schedule/dialogs/eventDialog/components/EventDateTimeFields";
import { EventDescriptionField } from "@/schedule/dialogs/eventDialog/components/EventDescriptionField";
import { EventDialogFooter } from "@/schedule/dialogs/eventDialog/components/EventDialogFooter";
import { EventDialogHeader } from "@/schedule/dialogs/eventDialog/components/EventDialogHeader";
import { EventExternalInfo } from "@/schedule/dialogs/eventDialog/components/EventExternalInfo";
import { EventLocationField } from "@/schedule/dialogs/eventDialog/components/EventLocationField";
import { EventRecurrenceFields } from "@/schedule/dialogs/eventDialog/components/EventRecurrenceFields";
import { EventTagSelector } from "@/schedule/dialogs/eventDialog/components/EventTagSelector";
import { EventTitleField } from "@/schedule/dialogs/eventDialog/components/EventTitleField";
import { SectionDivider } from "@/schedule/dialogs/eventDialog/components/SectionDivider";
import { useCallback } from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDialog: React.FC = () => {
  const { isOpen, close, error } = useEventDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      close: state.close,
      error: state.formFields.error,
    })),
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <EventDialogHeader />

        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <EventTitleField />
          <EventDescriptionField />
          <EventLocationField />
          <SectionDivider />
          <EventDateTimeFields />
          <EventAllDayToggle />
          <EventRecurrenceFields />
          <SectionDivider />
          <EventTagSelector />
          <SectionDivider />
          <EventExternalInfo />
          <EventColorPicker />
        </div>

        <EventDialogFooter />
      </DialogContent>
    </Dialog>
  );
};
