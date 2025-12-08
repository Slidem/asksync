"use client";

import { Pause, Play, SkipForward, Square } from "lucide-react";
import {
  formatTime,
  getSessionColor,
  getSessionLabel,
} from "../utils/formatting";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "./CircularProgress";
import { FocusModeSelector } from "./FocusModeSelector";
import { TakeBreakDialog } from "./TakeBreakDialog";
import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { useInitializeWorkMode } from "../hooks/useInitializeWorkMode";
import { useSessionControls } from "../hooks/useSessionControls";
import { useShallow } from "zustand/react/shallow";
import { useTimerCompletion } from "../hooks/useTimerCompletion";
import { useTimerTick } from "../hooks/timer";
import { useWorkModeStore } from "../stores/workModeStore";
import { SessionType } from "../types";

/**
 * Main Pomodoro Timer Component
 * Manages work sessions with timer, controls, and visual feedback
 */
export const PomodoroTimer = memo(function PomodoroTimer() {
  const {
    sessionType,
    targetDuration,
    remainingTime,
    isRunning,
    isPaused,
    completedWorkSessions,
    settings,
  } = useWorkModeStore(
    useShallow((state) => ({
      sessionType: state.sessionType,
      targetDuration: state.targetDuration,
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      completedWorkSessions: state.completedWorkSessions,
      settings: state.settings,
    })),
  );

  // Initialize work mode
  const { isLoading } = useInitializeWorkMode();

  // Timer tick effect
  useTimerTick();

  // Handle timer completion
  const { autoStartCountdown, cancelAutoStart } = useTimerCompletion();

  // Session control handlers
  const { handleStart, handlePause, handleResume, handleSkip, handleComplete } =
    useSessionControls();

  // Handle manual break
  const handleTakeBreak = useCallback(
    async (breakType: SessionType) => {
      // End current work session
      await handleComplete();

      // Get the current focus mode and settings to determine break duration
      const currentState = useWorkModeStore.getState();
      const currentSettings = currentState.settings;
      const currentFocusMode = currentState.focusMode;

      // Calculate break duration based on current focus mode
      let breakDuration: number;
      if (currentSettings && currentFocusMode !== "custom") {
        const preset = currentSettings.presets[currentFocusMode];
        breakDuration =
          breakType === "longBreak"
            ? preset.longBreak * 60 * 1000
            : preset.shortBreak * 60 * 1000;
      } else {
        // Fallback to defaults
        breakDuration =
          breakType === "longBreak"
            ? (currentSettings?.defaultLongBreak || 15) * 60 * 1000
            : (currentSettings?.defaultShortBreak || 5) * 60 * 1000;
      }

      // Set break type and duration
      useWorkModeStore.setState({
        sessionType: breakType,
        targetDuration: breakDuration,
        remainingTime: breakDuration,
        isRunning: false,
        isPaused: false,
      });

      // Start break session
      setTimeout(async () => {
        await handleStart();
      }, 200);
    },
    [handleComplete, handleStart],
  );

  // Calculate progress percentage
  const progress = ((targetDuration - remainingTime) / targetDuration) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground text-xl">Loading...</div>
      </div>
    );
  }

  const sessionsBeforeLongBreak = settings?.sessionsBeforeLongBreak || 4;

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

      {/* Circular timer - much larger */}
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
      {!autoStartCountdown && <FocusModeSelector />}

      {/* Control buttons */}
      {!autoStartCountdown && (
        <ControlButtons
          isRunning={isRunning}
          isPaused={isPaused}
          sessionType={sessionType}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onSkip={handleSkip}
          onComplete={handleComplete}
          onTakeBreak={handleTakeBreak}
        />
      )}
    </div>
  );
});

/**
 * Session type badge component
 */
const SessionTypeBadge = memo(function SessionTypeBadge({
  sessionType,
}: {
  sessionType: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-lg font-medium px-4 py-2",
        sessionType === "work" && "border-blue-500 text-blue-600",
        sessionType === "shortBreak" && "border-green-500 text-green-600",
        sessionType === "longBreak" && "border-orange-500 text-orange-600",
      )}
    >
      {getSessionLabel(sessionType)}
    </Badge>
  );
});

/**
 * Timer display component
 */
const TimerDisplay = memo(function TimerDisplay({
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

/**
 * Control buttons component
 */
const ControlButtons = memo(function ControlButtons({
  isRunning,
  isPaused,
  sessionType,
  onStart,
  onPause,
  onResume,
  onSkip,
  onComplete,
  onTakeBreak,
}: {
  isRunning: boolean;
  isPaused: boolean;
  sessionType: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onTakeBreak: (breakType: SessionType) => void;
}) {
  const sessionColor = getSessionColor(sessionType);

  if (!isRunning && !isPaused) {
    return (
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={onStart}
          className={cn(
            "px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all",
            "bg-gradient-to-r text-white hover:scale-105",
            sessionColor,
          )}
        >
          <Play className="mr-2 h-6 w-6" />
          Start Focus
        </Button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={onResume}
          className={cn(
            "px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all",
            "bg-gradient-to-r text-white hover:scale-105",
            sessionColor,
          )}
        >
          <Play className="mr-2 h-6 w-6" />
          Resume
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onSkip}
          className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-all"
        >
          <SkipForward className="mr-2 h-6 w-6" />
          Skip
        </Button>
      </div>
    );
  }

  // Active work session - show pause, take break, and end buttons
  if (sessionType === "work") {
    return (
      <div className="flex gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={onPause}
          className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
        >
          <Pause className="mr-2 h-6 w-6" />
          Pause
        </Button>
        <TakeBreakDialog onTakeBreak={onTakeBreak} />
        <Button
          size="lg"
          variant="destructive"
          onClick={onComplete}
          className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
        >
          <Square className="mr-2 h-6 w-6" />
          End
        </Button>
      </div>
    );
  }

  // Active break session - show pause, skip break, and end buttons
  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        variant="outline"
        onClick={onPause}
        className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
      >
        <Pause className="mr-2 h-6 w-6" />
        Pause
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onSkip}
        className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
      >
        <SkipForward className="mr-2 h-6 w-6" />
        Skip Break
      </Button>
      <Button
        size="lg"
        variant="destructive"
        onClick={onComplete}
        className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
      >
        <Square className="mr-2 h-6 w-6" />
        End
      </Button>
    </div>
  );
});
