"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { MiniTimerDisplay } from "@/work/components/sidebar/MiniTimerDisplay";
import { MiniTimerControls } from "@/work/components/sidebar/MiniTimerControls";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FloatingTimer - Mobile-only timer in fixed upper right position
 * Can be hidden with localStorage persistence
 */
export const FloatingTimer = memo(function FloatingTimer() {
  const { settings, floatingTimerVisible, setFloatingTimerVisible } =
    useWorkModeStore(
      useShallow((state) => ({
        settings: state.settings,
        floatingTimerVisible: state.floatingTimerVisible,
        setFloatingTimerVisible: state.setFloatingTimerVisible,
      })),
    );

  // Don't render until settings loaded
  if (!settings) return null;

  // Don't render if hidden
  if (!floatingTimerVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50",
        "bg-background border rounded-lg shadow-lg",
        "p-3",
        "md:hidden", // Only show on mobile
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <MiniTimerDisplay />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFloatingTimerVisible(false)}
            title="Hide timer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <MiniTimerControls />
      </div>
    </div>
  );
});
