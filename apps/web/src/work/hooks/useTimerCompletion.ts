import { useEffect, useState, useCallback } from "react";
import { useSessionControls } from "./useSessionControls";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "../stores/workModeStore";
import {
  notifyWorkComplete,
  notifyBreakComplete,
} from "../utils/notifications";

/**
 * Hook that handles timer completion with notifications and auto-start
 */
export function useTimerCompletion() {
  const {
    remainingTime,
    isRunning,
    activeSessionId,
    sessionType,
    settings,
    completedWorkSessions,
    setSessionType,
    incrementCompletedWorkSessions,
    resetCompletedWorkSessions,
  } = useWorkModeStore(
    useShallow((state) => ({
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      activeSessionId: state.activeSessionId,
      sessionType: state.sessionType,
      settings: state.settings,
      completedWorkSessions: state.completedWorkSessions,
      setSessionType: state.setSessionType,
      incrementCompletedWorkSessions: state.incrementCompletedWorkSessions,
      resetCompletedWorkSessions: state.resetCompletedWorkSessions,
    })),
  );

  const { handleComplete, handleStart } = useSessionControls();
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(
    null,
  );

  // Handle timer completion
  useEffect(() => {
    if (remainingTime === 0 && isRunning && activeSessionId) {
      handleComplete();

      // If work session completed, increment counter
      if (sessionType === "work") {
        incrementCompletedWorkSessions();
      }

      // If long break completed, reset counter
      if (sessionType === "longBreak") {
        resetCompletedWorkSessions();
      }

      // Show browser notification if enabled
      if (settings?.notificationsEnabled) {
        if (sessionType === "work") {
          notifyWorkComplete();
        } else {
          notifyBreakComplete(sessionType === "longBreak");
        }
      }

      // Check if auto-start is enabled
      const shouldAutoStart =
        (sessionType === "work" && settings?.autoStartBreaks) ||
        (sessionType !== "work" && settings?.autoStartWork);

      if (shouldAutoStart) {
        setAutoStartCountdown(3); // 3 second countdown
      }
    }
  }, [
    remainingTime,
    isRunning,
    activeSessionId,
    sessionType,
    settings,
    handleComplete,
    incrementCompletedWorkSessions,
    resetCompletedWorkSessions,
  ]);

  // Auto-start countdown logic
  useEffect(() => {
    if (autoStartCountdown !== null && autoStartCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoStartCountdown(autoStartCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoStartCountdown === 0) {
      // Determine next session type
      let nextSessionType: "work" | "shortBreak" | "longBreak";

      if (sessionType === "work") {
        // Work session just completed, determine break type
        const sessionsBeforeLongBreak = settings?.sessionsBeforeLongBreak || 4;
        // completedWorkSessions was already incremented, so check if we've hit the threshold
        const shouldTakeLongBreak = completedWorkSessions >= sessionsBeforeLongBreak;
        nextSessionType = shouldTakeLongBreak ? "longBreak" : "shortBreak";
      } else {
        // Break session completed, next is work
        nextSessionType = "work";
      }

      setSessionType(nextSessionType);
      setAutoStartCountdown(null);

      // Start the next session
      setTimeout(() => {
        handleStart();
      }, 100);
    }
  }, [
    autoStartCountdown,
    sessionType,
    completedWorkSessions,
    settings,
    setSessionType,
    handleStart,
  ]);

  const cancelAutoStart = useCallback(() => {
    setAutoStartCountdown(null);
  }, []);

  return {
    autoStartCountdown,
    cancelAutoStart,
  };
}
