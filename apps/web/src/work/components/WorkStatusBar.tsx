"use client";

import { CheckCircle, Clock, Flame, MessageCircle } from "lucide-react";

import { api } from "@convex/api";
import { formatDuration } from "../utils/formatting";
import { memo } from "react";
import { useQuery } from "convex/react";

/**
 * Status bar component showing today's work statistics
 */
export const WorkStatusBar = memo(function WorkStatusBar() {
  const todaysSessions = useQuery(
    api.workSessions.queries.session.getTodaysSessions,
  );

  const isLoading = todaysSessions === undefined;

  if (isLoading) {
    return null;
  }

  const { stats: todaysStats } = todaysSessions;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          {/* Sessions count */}
          <StatItem
            icon={<div className="text-2xl">🍅</div>}
            value={todaysStats ? todaysStats.totalSessions : 0}
            label="sessions"
          />

          {/* Total focus time */}
          <StatItem
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            value={
              todaysStats ? formatDuration(todaysStats.totalFocusTime) : "0m"
            }
            label="focus"
          />

          {/* Tasks completed */}
          <StatItem
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            value={todaysStats?.totalTasks || 0}
            label="tasks"
          />

          {/* Questions answered */}
          <StatItem
            icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
            value={todaysStats?.totalQuestions || 0}
            label="questions"
          />

          {/* Current streak */}
          <StatItem
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            value={todaysStats?.currentStreak || 0}
            label="day streak"
          />
        </div>
      </div>
    </div>
  );
});

/**
 * Individual stat item component
 */
const StatItem = memo(function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
});
