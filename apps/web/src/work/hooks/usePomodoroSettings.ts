import { api } from "@/../../backend/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Hook to fetch pomodoro settings
 */
export function usePomodoroSettings() {
  return useQuery(api.workSessions.queries.session.getPomodoroSettings);
}
