"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { EventChecklistsTab } from "@/schedule/dialogs/eventDialog/components/tabs/EventChecklistsTab";
import { EventDateTimeTab } from "@/schedule/dialogs/eventDialog/components/tabs/EventDateTimeTab";
import { EventDetailsTab } from "@/schedule/dialogs/eventDialog/components/tabs/EventDetailsTab";
import { EventDialogFooter } from "@/schedule/dialogs/eventDialog/components/EventDialogFooter";
import { EventDialogHeader } from "@/schedule/dialogs/eventDialog/components/EventDialogHeader";
import { EventExternalInfo } from "@/schedule/dialogs/eventDialog/components/EventExternalInfo";
import { EventPermissionsTab } from "@/schedule/dialogs/eventDialog/components/tabs/EventPermissionsTab";
import { EventTagsTab } from "@/schedule/dialogs/eventDialog/components/tabs/EventTagsTab";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

const TAB_VALUES = [
  "details",
  "datetime",
  "tags",
  "checklists",
  "permissions",
] as const;

export const EventDialog: React.FC = () => {
  const { isOpen, close, isExternalEvent, activeTab, setActiveTab, error } =
    useEventDialogStore(
      useShallow((state) => ({
        isOpen: state.isOpen,
        close: state.close,
        isExternalEvent: state.isExternalEvent,
        activeTab: state.activeTab,
        setActiveTab: state.setActiveTab,
        error: state.formFields.error,
      })),
    );

  const tabsWithErrors = error ? [1] : [];

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const index = TAB_VALUES.indexOf(value as (typeof TAB_VALUES)[number]);
      if (index !== -1) {
        setActiveTab(index);
      }
    },
    [setActiveTab],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <EventDialogHeader />

        {isExternalEvent && <EventExternalInfo />}

        <UnderlineTabs
          value={TAB_VALUES[activeTab]}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <UnderlineTabsList className="grid w-full grid-cols-5">
            <UnderlineTabsTrigger
              value="details"
              className={cn("font-semibold")}
            >
              Details
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="datetime"
              className={cn("font-semibold")}
              hasError={tabsWithErrors.includes(1)}
            >
              Date & Time
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="tags" className={cn("font-semibold")}>
              Tags
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="checklists"
              className={cn("font-semibold")}
            >
              Checklists
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="permissions"
              className={cn("font-semibold")}
            >
              Permissions
            </UnderlineTabsTrigger>
          </UnderlineTabsList>

          <UnderlineTabsContent value="details" className="mt-4">
            <EventDetailsTab />
          </UnderlineTabsContent>

          <UnderlineTabsContent value="datetime" className="mt-4">
            <EventDateTimeTab />
          </UnderlineTabsContent>

          <UnderlineTabsContent value="tags" className="mt-4">
            <EventTagsTab />
          </UnderlineTabsContent>

          <UnderlineTabsContent value="checklists" className="mt-4">
            <EventChecklistsTab />
          </UnderlineTabsContent>

          <UnderlineTabsContent value="permissions" className="mt-4">
            <EventPermissionsTab />
          </UnderlineTabsContent>
        </UnderlineTabs>

        <EventDialogFooter />
      </DialogContent>
    </Dialog>
  );
};
