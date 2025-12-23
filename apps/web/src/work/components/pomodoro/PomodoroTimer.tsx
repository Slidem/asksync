"use client";

import { memo, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/work/components/pomodoro/CircularProgress";
import { ControlButtons } from "@/work/components/pomodoro/ControlButtons";
import { FocusModeSelector } from "@/work/components/pomodoro/FocusModeSelector";
import { SessionTypeBadge } from "@/work/components/pomodoro/SessionBadgeType";
import { TimerDisplay } from "@/work/components/pomodoro/TimerDisplay";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

/**
 * Main Pomodoro Timer Component
 * Reads timer state from global store (SidebarTimer handles tick/completion)
 */
export const PomodoroTimer = memo(function PomodoroTimer() {
  const {
    sessionType,
    targetDuration,
    remainingTime,
    isRunning,
    completedWorkSessions,
    settings,
    autoStartCountdown,
    setAutoStartCountdown,
  } = useWorkModeStore(
    useShallow((state) => ({
      sessionType: state.sessionType,
      targetDuration: state.targetDuration,
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      completedWorkSessions: state.completedWorkSessions,
      settings: state.settings,
      autoStartCountdown: state.autoStartCountdown,
      setAutoStartCountdown: state.setAutoStartCountdown,
    })),
  );

  const cancelAutoStart = useCallback(() => {
    setAutoStartCountdown(null);
  }, [setAutoStartCountdown]);

  const progress = ((targetDuration - remainingTime) / targetDuration) * 100;

  // Settings loaded by SidebarTimer, show loading if not ready
  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground text-xl">Loading...</div>
      </div>
    );
  }

  const sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak || 4;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Session type badge */}
      <SessionTypeBadge sessionType={sessionType} />

      {/* Session progress indicator */}
      {sessionType === "work" && (
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Session {completedWorkSessions + 1}/{sessionsBeforeLongBreak} before
          long break
        </Badge>
      )}

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

      {/* Focus mode selector */}
      {autoStartCountdown === null && (
        <>
          <FocusModeSelector />
          <ControlButtons />
        </>
      )}
    </div>
  );
});
