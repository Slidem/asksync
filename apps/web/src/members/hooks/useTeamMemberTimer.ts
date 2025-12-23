import { useCallback, useRef, useState } from "react";

import { WorkStatus } from "@/members/components/WorkStatusIndicator";

interface UseTeamMemberTimerProps {
  expectedEndAt?: number;
  status: WorkStatus;
}

export function useTeamMemberTimer({
  expectedEndAt,
  status,
}: UseTeamMemberTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    expectedEndAt ? Math.max(0, expectedEndAt - Date.now()) : 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shouldTick = status === "working" || status === "break";

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!shouldTick || !expectedEndAt) return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, expectedEndAt - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
  }, [shouldTick, expectedEndAt]);

  // Start/stop interval based on status
  if (shouldTick && expectedEndAt && !intervalRef.current) {
    startInterval();
  } else if (!shouldTick && intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return timeRemaining;
}
