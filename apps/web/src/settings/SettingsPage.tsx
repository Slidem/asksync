"use client";

import { Bell, Timer } from "lucide-react";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { NotificationsTab } from "./components/NotificationsTab";
import { WorkModeSettings } from "./components/WorkModeSettings";

export function SettingsPage(): React.ReactNode {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and application settings
        </p>
      </div>

      <UnderlineTabs defaultValue="work-mode" className="w-full">
        <UnderlineTabsList className="grid w-full max-w-md grid-cols-2">
          <UnderlineTabsTrigger
            value="work-mode"
            className="gap-2"
            icon={<Timer className="h-4 w-4" />}
          >
            Work Mode
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger
            value="notifications"
            className="gap-2"
            icon={<Bell className="h-4 w-4" />}
          >
            Notifications
          </UnderlineTabsTrigger>
        </UnderlineTabsList>

        <UnderlineTabsContent value="work-mode" className="mt-6">
          <WorkModeSettings />
        </UnderlineTabsContent>

        <UnderlineTabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </UnderlineTabsContent>
      </UnderlineTabs>
    </div>
  );
}
