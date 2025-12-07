"use client";

import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";
import { Timer } from "lucide-react";
import { WorkModeSettings } from "./components/WorkModeSettings";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and application settings
        </p>
      </div>

      <UnderlineTabs defaultValue="work-mode" className="w-full">
        <UnderlineTabsList className="grid w-full max-w-md grid-cols-1">
          <UnderlineTabsTrigger
            value="work-mode"
            className="gap-2"
            icon={<Timer className="h-4 w-4" />}
          >
            Work Mode
          </UnderlineTabsTrigger>
        </UnderlineTabsList>

        <UnderlineTabsContent value="work-mode" className="mt-6">
          <WorkModeSettings />
        </UnderlineTabsContent>
      </UnderlineTabs>
    </div>
  );
}
