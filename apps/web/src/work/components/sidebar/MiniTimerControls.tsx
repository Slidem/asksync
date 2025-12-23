"use client";

import { Pause, Play, SkipForward, Square } from "lucide-react";
import {
  useEndSession,
  usePauseSession,
  useResume,
  useSkipSession,
  useStartWork,
} from "@/work/hooks/sessionControls";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

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
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleStart}
              >
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // Paused - show resume and skip
  if (isPaused) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleResume}
              >
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resume</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Skip</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // Running - show pause, skip (for breaks), end
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePause}
            >
              <Pause className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pause</TooltipContent>
        </Tooltip>
        {sessionType !== "work" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Skip Break</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleEnd}
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>End Session</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});
