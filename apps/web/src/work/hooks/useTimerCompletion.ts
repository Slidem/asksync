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
    setSessionType,
  } = useWorkModeStore(
    useShallow((state) => ({
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      activeSessionId: state.activeSessionId,
      sessionType: state.sessionType,
      settings: state.settings,
      setSessionType: state.setSessionType,
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
      const nextSessionType = sessionType === "work" ? "shortBreak" : "work";
      setSessionType(nextSessionType);
      setAutoStartCountdown(null);

      // Start the next session
      setTimeout(() => {
        handleStart();
      }, 100);
    }
  }, [autoStartCountdown, sessionType, setSessionType, handleStart]);

  const cancelAutoStart = useCallback(() => {
    setAutoStartCountdown(null);
  }, []);

  return {
    autoStartCountdown,
    cancelAutoStart,
  };
}
