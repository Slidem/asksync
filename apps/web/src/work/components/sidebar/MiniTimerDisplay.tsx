"use client";

import { memo } from "react";

import { cn } from "@/lib/utils";
import { formatMillisecondsToTimeDuration } from "@/lib/date";
import { getSessionColor } from "@/work/utils/sessionUtils";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const MiniTimerDisplay = memo(function MiniTimerDisplay() {
  const { remainingTime, sessionType, isRunning } = useWorkModeStore(
    useShallow((state) => ({
      remainingTime: state.remainingTime,
      sessionType: state.sessionType,
      isRunning: state.isRunning,
    })),
  );

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isRunning && "animate-pulse",
          "bg-gradient-to-r",
          getSessionColor(sessionType),
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {formatMillisecondsToTimeDuration(remainingTime)}
      </span>
    </div>
  );
});
