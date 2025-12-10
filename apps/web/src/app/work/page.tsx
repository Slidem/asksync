"use client";

import { Button } from "@/components/ui/button";
import { FocusPanelDrawer } from "@/work/components/FocusPanelDrawer";
import Link from "next/link";
import { PomodoroTimer } from "@/work/components/pomodoro/PomodoroTimer";
import { Settings } from "lucide-react";
import { WorkStatusBar } from "@/work/components/WorkStatusBar";

export default function WorkModePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col h-full">
      {/* Settings Button - Fixed top-right */}
      <div className="absolute top-4 right-4 z-20">
        <Link href="/settings">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Main Content Area - Timer centered */}
      <div className="flex-1 flex items-center justify-center p-6">
        <PomodoroTimer />
      </div>

      {/* Focus Panel Drawer - Fixed on right */}
      <FocusPanelDrawer />

      {/* Status Bar - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <WorkStatusBar />
      </div>
    </div>
  );
}
