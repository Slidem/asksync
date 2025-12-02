"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const TAB_VALUES = ["details", "datetime", "tags", "permissions"] as const;

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

        <Tabs
          value={TAB_VALUES[activeTab]}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className={cn("font-semibold")}>
              Details
            </TabsTrigger>
            <TabsTrigger
              value="datetime"
              className={cn(
                "font-semibold",
                tabsWithErrors.includes(1) && "text-red-600",
              )}
            >
              Date & Time
            </TabsTrigger>
            <TabsTrigger value="tags" className={cn("font-semibold")}>
              Tags
            </TabsTrigger>
            <TabsTrigger value="permissions" className={cn("font-semibold")}>
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <EventDetailsTab />
          </TabsContent>

          <TabsContent value="datetime" className="mt-4">
            <EventDateTimeTab />
          </TabsContent>

          <TabsContent value="tags" className="mt-4">
            <EventTagsTab />
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <EventPermissionsTab />
          </TabsContent>
        </Tabs>

        <EventDialogFooter />
      </DialogContent>
    </Dialog>
  );
};
