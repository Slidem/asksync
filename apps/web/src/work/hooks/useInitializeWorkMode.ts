import { useEffect, useRef } from "react";

import { api } from "@/../../backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useWorkModeStore } from "../stores/workModeStore";

/**
 * Unified initialization hook for Work Mode
 * Loads all necessary data on mount and manages cleanup
 */
export function useInitializeWorkMode() {
  const initialized = useRef(false);
  const deviceId = useWorkModeStore((state) => state.deviceId);

  const activeSession = useQuery(api.workSessions.queries.getActiveSession, {
    deviceId,
  });
  const pomodoroSettings = useQuery(
    api.workSessions.queries.getPomodoroSettings,
  );
  const todaysSessions = useQuery(api.workSessions.queries.getTodaysSessions);

  // Store actions
  const {
    setSettings,
    setActiveSession,
    setSessionStatus,
    setRemainingTime,
    setIsRunning,
    setIsPaused,
    setSessionCount,
    setTodaysStats,
    reset,
  } = useWorkModeStore();

  useEffect(() => {
    if (pomodoroSettings && !initialized.current) {
      setSettings(pomodoroSettings);
    }
  }, [pomodoroSettings, setSettings]);

  useEffect(() => {
    if (activeSession !== undefined) {
      if (activeSession) {
        setActiveSession(activeSession._id);
        setSessionStatus(activeSession.status);
        setRemainingTime(activeSession.remainingTime);
        setIsRunning(activeSession.status === "active");
        setIsPaused(activeSession.status === "paused");
      } else if (initialized.current) {
        // Only reset if we've been initialized and session disappeared
        reset();
      }
    }
  }, [
    activeSession,
    setActiveSession,
    setSessionStatus,
    setRemainingTime,
    setIsRunning,
    setIsPaused,
    reset,
  ]);

  useEffect(() => {
    if (todaysSessions) {
      setSessionCount(todaysSessions.stats.totalSessions);
      setTodaysStats(todaysSessions.stats);
    }
  }, [todaysSessions, setSessionCount, setTodaysStats]);

  useEffect(() => {
    if (
      pomodoroSettings !== undefined &&
      activeSession !== undefined &&
      todaysSessions !== undefined &&
      !initialized.current
    ) {
      initialized.current = true;
    }
  }, [pomodoroSettings, activeSession, todaysSessions]);

  return {
    isLoading:
      pomodoroSettings === undefined ||
      activeSession === undefined ||
      todaysSessions === undefined,
    isInitialized: initialized.current,
  };
}
