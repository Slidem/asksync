"use client";

import { FocusPanelDrawer } from "@/work/components/FocusPanelDrawer";
import { PomodoroTimer } from "@/work/components/PomodoroTimer";
import { WorkStatusBar } from "@/work/components/WorkStatusBar";

export default function WorkModePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col h-full">
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
