import { useQuery } from "convex/react";
import { api } from "@/../../backend/convex/_generated/api";
import { PomodoroSettings } from "../types";

/**
 * Hook to fetch pomodoro settings
 */
export function usePomodoroSettings(): PomodoroSettings | undefined {
  return useQuery(api.workSessions.queries.session.getPomodoroSettings);
}
