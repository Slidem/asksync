import { api } from "@convex/api";
import { useQuery } from "convex/react";

export const usePomodoroSettings = () => {
  const pomodoroSettings = useQuery(
    api.workSessions.queries.getPomodoroSettings,
  );

  return {
    isLoading: pomodoroSettings === undefined,
    settings: pomodoroSettings,
  };
};
