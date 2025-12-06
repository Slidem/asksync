import { useEffect } from "react";
import { useSessionControls } from "./useSessionControls";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "../stores/workModeStore";

/**
 * Hook that handles timer completion
 */
export function useTimerCompletion() {
  const { remainingTime, isRunning, activeSessionId } = useWorkModeStore(
    useShallow((state) => ({
      remainingTime: state.remainingTime,
      isRunning: state.isRunning,
      activeSessionId: state.activeSessionId,
    })),
  );

  const { handleComplete } = useSessionControls();

  useEffect(() => {
    if (remainingTime === 0 && isRunning && activeSessionId) {
      handleComplete();
    }
  }, [remainingTime, isRunning, activeSessionId, handleComplete]);
}
