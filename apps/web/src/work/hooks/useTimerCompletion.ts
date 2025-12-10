import {
  notifyBreakComplete,
  notifyWorkComplete,
} from "@/work/utils/notifications";
import { useCallback, useEffect, useState } from "react";

import { api } from "@convex/api";
import { useMutation } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import { useStartWork } from "@/work/hooks/sessionControls";
import { useWorkModeStore } from "@/work/stores/workModeStore";

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
    resetToNextSessionType,
  } = useWorkModeStore(
    useShallow((state) => ({
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      activeSessionId: state.activeSessionId,
      sessionType: state.sessionType,
      settings: state.settings,
      completedWorkSessions: state.completedWorkSessions,
      setSessionType: state.setSessionType,
      resetToNextSessionType: state.resetToNextSessionType,
    })),
  );

  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(
    null,
  );

  const endSession = useMutation(api.workSessions.mutations.session.endSession);

  const startSession = useStartWork();

  // Handle timer completion
  useEffect(() => {
    if (remainingTime > 0 || !isRunning || !activeSessionId) {
      return;
    }

    const startCountdownIfEnabled = () => {
      const shouldAutoStart =
        (sessionType === "work" && settings?.autoStartBreaks) ||
        (sessionType !== "work" && settings?.autoStartWork);

      if (shouldAutoStart) {
        setAutoStartCountdown(3); // 3 second countdown
      }
    };

    const notifyCompletion = () => {
      if (settings?.notificationsEnabled) {
        if (sessionType === "work") {
          notifyWorkComplete();
        }

        if (sessionType !== "work") {
          notifyBreakComplete(sessionType === "longBreak");
        }
      }
    };

    const handleCompletion = async () => {
      if (activeSessionId) {
        await endSession({ sessionId: activeSessionId, completed: true });
      }
      resetToNextSessionType();
    };

    notifyCompletion();
    handleCompletion();
    startCountdownIfEnabled();
  }, [
    remainingTime,
    isRunning,
    activeSessionId,
    sessionType,
    settings,
    endSession,
    resetToNextSessionType,
  ]);

  useEffect(() => {
    if (autoStartCountdown !== null && autoStartCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoStartCountdown(autoStartCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStartCountdown]);

  useEffect(() => {
    if (autoStartCountdown === 0) {
      setAutoStartCountdown(null);
      startSession();
    }
  }, [autoStartCountdown, startSession]);

  const cancelAutoStart = useCallback(() => {
    setAutoStartCountdown(null);
  }, []);

  return {
    autoStartCountdown,
    cancelAutoStart,
  };
}
