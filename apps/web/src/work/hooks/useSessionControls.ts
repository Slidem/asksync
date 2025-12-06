import { api } from "@/../../backend/convex/_generated/api";
import { playPomodoroCompletionSound } from "../sound";
import { useCallback } from "react";
import { useMutation } from "convex/react";
import { useWorkModeStore } from "../stores/workModeStore";

/**
 * Hook for managing session controls (start, pause, resume, skip, complete)
 */
export function useSessionControls() {
  const {
    sessionType,
    focusMode,
    targetDuration,
    activeSessionId,
    deviceId,
    settings,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
    reset,
    currentTimeblockId,
    currentTaskId,
  } = useWorkModeStore();

  // Mutations
  const startSession = useMutation(api.workSessions.mutations.startSession);
  const pauseSession = useMutation(api.workSessions.mutations.pauseSession);
  const resumeSession = useMutation(api.workSessions.mutations.resumeSession);
  const endSession = useMutation(api.workSessions.mutations.endSession);

  const handleStart = useCallback(async () => {
    const sessionId = await startSession({
      sessionType,
      targetDuration,
      focusMode,
      customDuration: focusMode === "custom" ? targetDuration : undefined,
      timeblockId: currentTimeblockId || undefined,
      taskId: currentTaskId || undefined,
      deviceId,
    });

    setActiveSession(sessionId);
    setSessionStatus("active");
    setIsRunning(true);
    setIsPaused(false);
  }, [
    startSession,
    sessionType,
    targetDuration,
    focusMode,
    currentTimeblockId,
    currentTaskId,
    deviceId,
    setActiveSession,
    setSessionStatus,
    setIsRunning,
    setIsPaused,
  ]);

  const handlePause = useCallback(async () => {
    if (activeSessionId) {
      await pauseSession({ sessionId: activeSessionId });
      setSessionStatus("paused");
      setIsPaused(true);
    }
  }, [activeSessionId, pauseSession, setSessionStatus, setIsPaused]);

  const handleResume = useCallback(async () => {
    if (activeSessionId) {
      await resumeSession({ sessionId: activeSessionId });
      setSessionStatus("active");
      setIsPaused(false);
    }
  }, [activeSessionId, resumeSession, setSessionStatus, setIsPaused]);

  const handleSkip = useCallback(async () => {
    if (activeSessionId) {
      await endSession({ sessionId: activeSessionId, completed: false });
    }
    reset();
  }, [activeSessionId, endSession, reset]);

  const handleComplete = useCallback(async () => {
    if (activeSessionId) {
      await endSession({ sessionId: activeSessionId, completed: true });
    }
    reset();

    // Play completion sound if enabled
    if (settings?.soundEnabled) {
      playPomodoroCompletionSound();
    }
  }, [activeSessionId, endSession, reset, settings?.soundEnabled]);

  return {
    handleStart,
    handlePause,
    handleResume,
    handleSkip,
    handleComplete,
  };
}
