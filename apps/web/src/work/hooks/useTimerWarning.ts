import { useEffect, useRef } from "react";

import { playCountdownSound } from "@/work/sound";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { useShallow } from "zustand/react/shallow";

const FIVE_SECONDS_MS = 5000;

/**
 * Plays countdown sound at 5 seconds remaining
 * Should only be called in ONE place (SidebarTimer) to avoid duplicates
 */
export function useTimerWarning() {
  const firedRef = useRef(false);

  const { remainingTime, isRunning, isPaused, settings, countdownSoundFired } =
    useWorkModeStore(
      useShallow((state) => ({
        remainingTime: state.remainingTime,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        settings: state.settings,
        countdownSoundFired: state.countdownSoundFired,
      })),
    );

  // Reset local ref when store resets
  useEffect(() => {
    if (!countdownSoundFired) {
      firedRef.current = false;
    }
  }, [countdownSoundFired]);

  // Play countdown sound at 5 seconds
  useEffect(() => {
    if (
      isRunning &&
      !isPaused &&
      !firedRef.current &&
      remainingTime <= FIVE_SECONDS_MS &&
      remainingTime > 0 &&
      settings?.soundEnabled
    ) {
      firedRef.current = true;
      useWorkModeStore.getState().setCountdownSoundFired(true);
      playCountdownSound();
    }
  }, [remainingTime, isRunning, isPaused, settings?.soundEnabled]);
}
