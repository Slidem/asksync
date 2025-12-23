"use client";

import { FocusPanel } from "@/work/components/focusPanel/FocusPanel";
import { PomodoroTimer } from "@/work/components/pomodoro/PomodoroTimer";
import { WorkStatusBar } from "@/work/components/WorkStatusBar";

export default function WorkModePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 h-full">
      {/* Main layout - flexbox row on desktop */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Timer section - takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Timer centered */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-6">
            <PomodoroTimer />
          </div>

          {/* Status bar inside timer section */}
          <div className="w-full">
            <WorkStatusBar />
          </div>
        </div>

        {/* Focus panel - side panel on desktop, bottom sheet on mobile */}
        <FocusPanel />
      </div>
    </div>
  );
}
