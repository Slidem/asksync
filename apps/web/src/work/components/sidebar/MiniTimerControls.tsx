"use client";

import { memo } from "react";
import { Pause, Play, SkipForward, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import {
  useEndSession,
  usePauseSession,
  useResume,
  useSkipSession,
  useStartWork,
} from "@/work/hooks/sessionControls";

export const MiniTimerControls = memo(function MiniTimerControls() {
  const { isRunning, isPaused, sessionType } = useWorkModeStore(
    useShallow((state) => ({
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      sessionType: state.sessionType,
    })),
  );

  const handleStart = useStartWork();
  const handlePause = usePauseSession();
  const handleResume = useResume();
  const handleEnd = useEndSession();
  const handleSkip = useSkipSession();

  // Not running and not paused - show start
  if (!isRunning && !isPaused) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleStart}
          title="Start"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Paused - show resume and skip
  if (isPaused) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleResume}
          title="Resume"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSkip}
          title="Skip"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Running - show pause, skip (for breaks), end
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handlePause}
        title="Pause"
      >
        <Pause className="h-4 w-4" />
      </Button>
      {sessionType !== "work" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSkip}
          title="Skip Break"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive"
        onClick={handleEnd}
        title="End"
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
});
