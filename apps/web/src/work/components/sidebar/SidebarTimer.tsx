"use client";

import { Eye } from "lucide-react";
import { MiniTimerControls } from "@/work/components/sidebar/MiniTimerControls";
import { MiniTimerDisplay } from "@/work/components/sidebar/MiniTimerDisplay";
import { Button } from "@/components/ui/button";
import { memo } from "react";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { useShallow } from "zustand/react/shallow";

interface SidebarTimerProps {
  hideDisplay?: boolean;
}

export const SidebarTimer = memo(function SidebarTimer({
  hideDisplay = false,
}: SidebarTimerProps) {
  const { settings, floatingTimerVisible, setFloatingTimerVisible } =
    useWorkModeStore(
      useShallow((state) => ({
        settings: state.settings,
        floatingTimerVisible: state.floatingTimerVisible,
        setFloatingTimerVisible: state.setFloatingTimerVisible,
      })),
    );

  // Don't render display until settings are loaded
  if (!settings || hideDisplay) {
    return null;
  }

  return (
    <div className="px-3 py-3 border-t">
      <div className="flex items-center justify-between">
        <MiniTimerDisplay />
        <MiniTimerControls />
      </div>

      {/* Show button to unhide floating timer on mobile */}
      {!floatingTimerVisible && (
        <div className="mt-2 md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setFloatingTimerVisible(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Floating Timer
          </Button>
        </div>
      )}
    </div>
  );
});
