import { useEffect, useRef } from "react";

import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const useTimerTick = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { tick, isRunning, isPaused } = useWorkModeStore(
    useShallow((state) => ({
      tick: state.tick,
      isRunning: state.isRunning,
      isPaused: state.isPaused,
    })),
  );
  // Timer tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, tick]);
};
