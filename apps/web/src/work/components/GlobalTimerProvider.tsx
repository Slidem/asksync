"use client";

import { useTimerCompletion } from "@/work/hooks/useTimerCompletion";
import { useTimerTick } from "@/work/hooks/timer";
import { useTimerWarning } from "@/work/hooks/useTimerWarning";
import { useInitializeWorkMode } from "@/work/hooks/useInitializeWorkMode";

/**
 * GlobalTimerProvider - Always mounted component that runs timer hooks
 * Ensures timer continues running even when sidebar is closed on mobile
 */
export function GlobalTimerProvider() {
  // Initialize settings and restore active session
  useInitializeWorkMode();

  // Keep timer ticking
  useTimerTick();

  // Handle timer completion
  useTimerCompletion();

  // Handle 5-second warning sound
  useTimerWarning();

  // This component doesn't render anything
  return null;
}
