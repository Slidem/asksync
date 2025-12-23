"use client";

import { memo, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/work/components/pomodoro/CircularProgress";
import { TimerControlsBar } from "@/work/components/pomodoro/TimerControlsBar";
import { TimerDisplay } from "@/work/components/pomodoro/TimerDisplay";
import { TimerInfoBar } from "@/work/components/pomodoro/TimerInfoBar";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

/**
 * Main Pomodoro Timer Component
 * Reads timer state from global store (GlobalTimerProvider handles tick/completion)
 */
export const PomodoroTimer = memo(function PomodoroTimer() {
  const {
    sessionType,
    targetDuration,
    remainingTime,
    isRunning,
    settings,
    autoStartCountdown,
    setAutoStartCountdown,
  } = useWorkModeStore(
    useShallow((state) => ({
      sessionType: state.sessionType,
      targetDuration: state.targetDuration,
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      settings: state.settings,
      autoStartCountdown: state.autoStartCountdown,
      setAutoStartCountdown: state.setAutoStartCountdown,
    })),
  );

  const cancelAutoStart = useCallback(() => {
    setAutoStartCountdown(null);
  }, [setAutoStartCountdown]);

  const progress = ((targetDuration - remainingTime) / targetDuration) * 100;

  // Settings loaded by GlobalTimerProvider, show loading if not ready
  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Info bar - session type, count, mode, settings */}
      <TimerInfoBar />

      {/* Circular timer */}
      <CircularProgress
        progress={progress}
        sessionType={sessionType}
        isRunning={isRunning}
      >
        <TimerDisplay
          time={remainingTime}
          isRunning={isRunning}
          sessionType={sessionType}
        />
      </CircularProgress>

      {/* Auto-start countdown badge */}
      {autoStartCountdown !== null && (
        <Badge
          variant="secondary"
          className="text-base px-4 py-2 animate-pulse"
        >
          Auto-starting in {autoStartCountdown}s
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelAutoStart}
            className="ml-2 h-6 px-2"
          >
            Cancel
          </Button>
        </Badge>
      )}

      {/* Controls bar */}
      {autoStartCountdown === null && <TimerControlsBar />}
    </div>
  );
});
