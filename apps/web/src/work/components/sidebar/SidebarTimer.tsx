"use client";

import { MiniTimerControls } from "@/work/components/sidebar/MiniTimerControls";
import { MiniTimerDisplay } from "@/work/components/sidebar/MiniTimerDisplay";
import { memo } from "react";
import { useInitializeWorkMode } from "@/work/hooks/useInitializeWorkMode";
import { useTimerCompletion } from "@/work/hooks/useTimerCompletion";
import { useTimerTick } from "@/work/hooks/timer";
import { useTimerWarning } from "@/work/hooks/useTimerWarning";
import { useWorkModeStore } from "@/work/stores/workModeStore";

interface SidebarTimerProps {
  hideDisplay?: boolean;
}

export const SidebarTimer = memo(function SidebarTimer({
  hideDisplay = false,
}: SidebarTimerProps) {
  const settings = useWorkModeStore((state) => state.settings);

  // Initialize settings and restore active session
  const { isLoading } = useInitializeWorkMode();

  // Keep timer ticking (only place this runs)
  useTimerTick();

  // Handle timer completion - notifications, auto-start (only place this runs)
  useTimerCompletion();

  // Handle 5-second warning sound (only place this runs)
  useTimerWarning();

  // Don't render display until settings are loaded, but hooks still run
  if (isLoading || !settings || hideDisplay) {
    return null;
  }

  return (
    <div className="px-3 py-3 border-t">
      <div className="flex items-center justify-between">
        <MiniTimerDisplay />
        <MiniTimerControls />
      </div>
    </div>
  );
});
