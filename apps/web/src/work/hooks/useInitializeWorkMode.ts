import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/work/utils/notifications";
import { useEffect, useRef } from "react";

import { api } from "@/../../backend/convex/_generated/api";
import { preloadSounds } from "@/work/sound";
import { useDeviceId } from "@/lib/device";
import { useQuery } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "../stores/workModeStore";

/**
 * Initialization hook for Work Mode
 * Loads settings and restores active session state from backend.
 * Called from SidebarTimer which is always mounted.
 */
export function useInitializeWorkMode() {
  const initialized = useRef(false);
  const deviceId = useDeviceId();

  const activeSession = useQuery(
    api.workSessions.queries.session.getActiveSession,
    {
      deviceId,
    },
  );
  const pomodoroSettings = useQuery(
    api.workSessions.queries.session.getPomodoroSettings,
  );
  const todaysSessions = useQuery(
    api.workSessions.queries.session.getTodaysSessions,
  );

  const isLoading =
    pomodoroSettings === undefined ||
    activeSession === undefined ||
    todaysSessions === undefined;

  // Store actions
  const {
    setSettings,
    setActiveSession,
    setFocusMode,
    setSessionType,
    setSessionStatus,
    setRemainingTime,
    setIsRunning,
    setIsPaused,
  } = useWorkModeStore(
    useShallow((state) => ({
      setSettings: state.setSettings,
      setActiveSession: state.setActiveSession,
      setSessionStatus: state.setSessionStatus,
      setRemainingTime: state.setRemainingTime,
      setIsRunning: state.setIsRunning,
      setIsPaused: state.setIsPaused,
      setFocusMode: state.setFocusMode,
      setSessionType: state.setSessionType,
    })),
  );

  useEffect(() => {
    return () => {
      initialized.current = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (initialized.current) {
      return;
    }

    initialized.current = true;

    if (pomodoroSettings) {
      setSettings(pomodoroSettings);

      // Preload sounds for instant playback
      if (pomodoroSettings.soundEnabled) {
        preloadSounds();
      }

      // Auto-request notification permission if enabled in settings
      if (pomodoroSettings.notificationsEnabled) {
        const permission = getNotificationPermission();
        if (permission === "default") {
          requestNotificationPermission();
        }
      }
    }

    if (activeSession) {
      setActiveSession(activeSession._id);
      setSessionStatus(activeSession.status);
      setSessionType(activeSession.sessionType);
      setFocusMode(activeSession.focusMode);
      setRemainingTime(activeSession.remainingTime);
      setIsRunning(activeSession.status === "active");
      setIsPaused(activeSession.status === "paused");
    }
  }, [
    activeSession,
    isLoading,
    pomodoroSettings,
    setActiveSession,
    setFocusMode,
    setIsPaused,
    setIsRunning,
    setRemainingTime,
    setSessionStatus,
    setSessionType,
    setSettings,
    todaysSessions,
  ]);

  return {
    isLoading,
  };
}
