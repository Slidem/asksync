import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useState } from "react";

export function useAnalyticsData() {
  const [days, setDays] = useState(7);

  const sessionHistory = useQuery(
    api.workSessions.queries.analytics.getSessionHistory,
    {
      days,
    },
  );
  const weeklyStats = useQuery(
    api.workSessions.queries.analytics.getWeeklyStats,
  );
  const sessionsByFocusMode = useQuery(
    api.workSessions.queries.analytics.getSessionsByFocusMode,
    { days: 30 },
  );
  const productivityMetrics = useQuery(
    api.workSessions.queries.analytics.getProductivityMetrics,
    { days: 30 },
  );

  return {
    sessionHistory,
    weeklyStats,
    sessionsByFocusMode,
    productivityMetrics,
    days,
    setDays,
    isLoading:
      sessionHistory === undefined ||
      weeklyStats === undefined ||
      sessionsByFocusMode === undefined ||
      productivityMetrics === undefined,
  };
}
