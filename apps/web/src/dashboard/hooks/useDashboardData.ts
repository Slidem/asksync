import { api } from "@convex/api";
import { useQuery } from "convex/react";

export function useDashboardData() {
  const todaysSessions = useQuery(
    api.workSessions.queries.session.getTodaysSessions,
  );
  const urgentQuestions = useQuery(api.questions.queries.getUrgentQuestions, {
    limit: 3,
  });

  const sessionStats = todaysSessions?.stats;

  return {
    sessionStats,
    urgentQuestions,
    isLoading:
      todaysSessions === undefined || urgentQuestions === undefined,
  };
}
