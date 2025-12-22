import { DEFAULT_WORK_DURATION_MINUTES } from "@/work/types";
import { api } from "@convex/api";
import { useCallback } from "react";
import { useDeviceId } from "@/lib/device";
import { useMutation } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const useStartWork = () => {
  const {
    focusMode,
    sessionType,
    settings,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
  } = useWorkModeStore(
    useShallow((state) => ({
      focusMode: state.focusMode,
      sessionType: state.sessionType,
      settings: state.settings,
      setActiveSession: state.setActiveSession,
      setSessionStatus: state.setSessionStatus,
      setIsRunning: state.setIsRunning,
      setIsPaused: state.setIsPaused,
    })),
  );

  const deviceId = useDeviceId();

  const startSession = useMutation(
    api.workSessions.mutations.session.startSession,
  );

  return useCallback(async () => {
    if (!settings) throw new Error("Settings not loaded");

    let targetDurationMinutes =
      settings?.defaultWorkDuration || DEFAULT_WORK_DURATION_MINUTES;

    if (focusMode !== "custom") {
      targetDurationMinutes = settings.presets[focusMode]
        ? settings.presets[focusMode].work
        : DEFAULT_WORK_DURATION_MINUTES;
    }

    const targetDurationMs = targetDurationMinutes * 60 * 1000;

    const sessionId = await startSession({
      sessionType,
      targetDuration: targetDurationMs,
      focusMode,
      customDuration: focusMode === "custom" ? targetDurationMs : undefined,
      deviceId,
    });

    setActiveSession(sessionId);
    setSessionStatus("active");
    setIsRunning(true);
    setIsPaused(false);
  }, [
    focusMode,
    sessionType,
    settings,
    deviceId,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
    startSession,
  ]);
};

export const useResume = () => {
  const { activeSessionId, setSessionStatus, setIsPaused } = useWorkModeStore(
    useShallow((state) => ({
      activeSessionId: state.activeSessionId,
      setSessionStatus: state.setSessionStatus,
      setIsPaused: state.setIsPaused,
    })),
  );

  const resumeSession = useMutation(
    api.workSessions.mutations.session.resumeSession,
  );

  return useCallback(async () => {
    if (!activeSessionId) {
      return;
    }

    await resumeSession({ sessionId: activeSessionId });
    setSessionStatus("active");
    setIsPaused(false);
  }, [activeSessionId, resumeSession, setIsPaused, setSessionStatus]);
};

export const useSkipSession = () => {
  const { activeSessionId, resetToNextSessionType } = useWorkModeStore(
    useShallow((state) => ({
      activeSessionId: state.activeSessionId,
      resetToNextSessionType: state.resetToNextSessionType,
    })),
  );

  const endSession = useMutation(api.workSessions.mutations.session.endSession);

  return useCallback(async () => {
    if (activeSessionId) {
      await endSession({ sessionId: activeSessionId, completed: false });
    }
    resetToNextSessionType();
  }, [activeSessionId, endSession, resetToNextSessionType]);
};

export const usePauseSession = () => {
  const { activeSessionId, setSessionStatus, setIsPaused } = useWorkModeStore(
    useShallow((state) => ({
      activeSessionId: state.activeSessionId,
      setSessionStatus: state.setSessionStatus,
      setIsPaused: state.setIsPaused,
    })),
  );

  const pauseSession = useMutation(
    api.workSessions.mutations.session.pauseSession,
  );

  return useCallback(async () => {
    if (activeSessionId) {
      await pauseSession({ sessionId: activeSessionId });
      setSessionStatus("paused");
      setIsPaused(true);
    }
  }, [activeSessionId, pauseSession, setSessionStatus, setIsPaused]);
};

export const useEndSession = () => {
  const { activeSessionId, reset } = useWorkModeStore(
    useShallow((state) => ({
      activeSessionId: state.activeSessionId,
      focusMode: state.focusMode,
      sessionType: state.sessionType,
      settings: state.settings,
      targetDuration: state.targetDuration,
      reset: state.reset,
    })),
  );

  const endSession = useMutation(api.workSessions.mutations.session.endSession);

  return useCallback(async () => {
    if (activeSessionId) {
      await endSession({ sessionId: activeSessionId, completed: true });
    }
    reset();
  }, [activeSessionId, endSession, reset]);
};

export const useTakeBreak = () => {
  const {
    resetToNextSessionType,
    activeSessionId,
    focusMode,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
  } = useWorkModeStore(
    useShallow((state) => ({
      resetToNextSessionType: state.resetToNextSessionType,
      activeSessionId: state.activeSessionId,
      focusMode: state.focusMode,
      setActiveSession: state.setActiveSession,
      setSessionStatus: state.setSessionStatus,
      setIsRunning: state.setIsRunning,
      setIsPaused: state.setIsPaused,
    })),
  );

  const deviceId = useDeviceId();
  const endSession = useMutation(api.workSessions.mutations.session.endSession);
  const startSession = useMutation(
    api.workSessions.mutations.session.startSession,
  );

  return useCallback(async () => {
    if (activeSessionId) {
      await endSession({ sessionId: activeSessionId, completed: true });
    }

    const nextBreak = resetToNextSessionType();

    setTimeout(async () => {
      await startSession({
        sessionType: nextBreak.sessionType,
        targetDuration: nextBreak.targetDuration,
        focusMode,
        deviceId,
      });

      setActiveSession(activeSessionId!);
      setSessionStatus("active");
      setIsRunning(true);
      setIsPaused(false);
    }, 200);
  }, [
    activeSessionId,
    resetToNextSessionType,
    endSession,
    startSession,
    focusMode,
    deviceId,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
  ]);
};
