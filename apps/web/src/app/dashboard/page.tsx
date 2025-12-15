"use client";

import { CurrentWorkWidget } from "@/dashboard/components/CurrentWorkWidget";
import { PendingTasksWidget } from "@/dashboard/components/PendingTasksWidget";
import { StreakCard } from "@/dashboard/components/StreakCard";
import { TodayStatsCard } from "@/dashboard/components/TodayStatsCard";
import { useDashboardData } from "@/dashboard/hooks/useDashboardData";

export default function Page() {
  const { activeSession, sessionStats, urgentQuestions, isLoading } =
    useDashboardData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CurrentWorkWidget activeSession={activeSession} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PendingTasksWidget urgentQuestions={urgentQuestions} />
            <TodayStatsCard sessionStats={sessionStats} />
            <StreakCard sessionStats={sessionStats} />
          </div>
        </>
      )}
    </div>
  );
}
