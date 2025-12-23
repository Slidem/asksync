"use client";

import { memo } from "react";
import {
  Coffee,
  Pause,
  Play,
  SkipForward,
  Square,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useEndSession,
  usePauseSession,
  useResume,
  useSkipSession,
  useStartWork,
  useTakeBreak,
} from "@/work/hooks/sessionControls";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { getSessionColor } from "@/work/utils/sessionUtils";

/**
 * Consolidated controls bar with small labeled buttons
 */
export const TimerControlsBar = memo(function TimerControlsBar() {
  const { isRunning, isPaused, sessionType, canTakeBreak } = useWorkModeStore(
    useShallow((state) => ({
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      sessionType: state.sessionType,
      canTakeBreak: state.focusMode !== "custom",
    })),
  );

  const handleStart = useStartWork();
  const handlePause = usePauseSession();
  const handleResume = useResume();
  const handleEnd = useEndSession();
  const handleSkip = useSkipSession();
  const handleTakeBreak = useTakeBreak();

  const sessionColor = getSessionColor(sessionType);

  // Idle state - large prominent start button
  if (!isRunning && !isPaused) {
    return (
      <Button
        size="lg"
        onClick={handleStart}
        className={cn(
          "px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all",
          "bg-gradient-to-r text-white hover:scale-105",
          sessionColor,
        )}
      >
        <Play className="mr-2 h-6 w-6" />
        Start Focus
      </Button>
    );
  }

  // Paused state - resume and skip
  if (isPaused) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleResume} className="gap-1.5">
          <Play className="h-4 w-4" />
          Resume
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSkip}
          className="gap-1.5"
        >
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>
      </div>
    );
  }

  // Running work session
  if (sessionType === "work") {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePause}
          className="gap-1.5"
        >
          <Pause className="h-4 w-4" />
          Pause
        </Button>
        {canTakeBreak && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleTakeBreak}
            className="gap-1.5"
          >
            <Coffee className="h-4 w-4" />
            Break
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleEnd}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Square className="h-4 w-4" />
          End
        </Button>
      </div>
    );
  }

  // Running break session
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handlePause}
        className="gap-1.5"
      >
        <Pause className="h-4 w-4" />
        Pause
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSkip}
        className="gap-1.5"
      >
        <SkipForward className="h-4 w-4" />
        Skip
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleEnd}
        className="gap-1.5 text-destructive hover:text-destructive"
      >
        <Square className="h-4 w-4" />
        End
      </Button>
    </div>
  );
});
