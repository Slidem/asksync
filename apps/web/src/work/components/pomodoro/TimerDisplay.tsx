import { cn } from "@/lib/utils";
import { formatTime } from "@/work/utils/timeFormatting";
import { getSessionColor } from "@/work/utils/sessionUtils";
import { memo } from "react";

/**
 * Timer display component
 */
export const TimerDisplay = memo(function TimerDisplay({
  time,
  isRunning,
  sessionType,
}: {
  time: number;
  isRunning: boolean;
  sessionType: string;
}) {
  return (
    <div className="text-center">
      <div className="text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums tracking-tight">
        {formatTime(time)}
      </div>
      {isRunning && (
        <div
          className={cn(
            "mt-4 w-3 h-3 rounded-full mx-auto animate-pulse",
            "bg-gradient-to-r",
            getSessionColor(sessionType),
          )}
        />
      )}
    </div>
  );
});
