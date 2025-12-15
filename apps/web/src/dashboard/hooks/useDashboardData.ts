import { api } from "@convex/api";
import { useQuery } from "convex/react";

export function useDashboardData() {
  const activeSession = useQuery(
    api.workSessions.queries.session.getActiveSession,
    {},
  );
  const todaysSessions = useQuery(
    api.workSessions.queries.session.getTodaysSessions,
  );
  const urgentQuestions = useQuery(api.questions.queries.getUrgentQuestions, {
    limit: 3,
  });

  const sessionStats = todaysSessions?.stats;

  return {
    activeSession,
    sessionStats,
    urgentQuestions,
    isLoading:
      activeSession === undefined ||
      todaysSessions === undefined ||
      urgentQuestions === undefined,
  };
}
