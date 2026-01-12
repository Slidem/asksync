"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface OverviewStatsProps {
  weeklyStats?: {
    thisWeek: {
      totalTime: number;
      sessions: number;
      tasksCompleted: number;
      questionsAnswered: number;
    };
    changes: {
      totalTime: number;
      sessions: number;
      tasksCompleted: number;
      questionsAnswered: number;
    };
  } | null;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  weeklyStats,
}) => {
  const formatMinutes = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const stats = [
    {
      label: "Focus Time",
      value: weeklyStats ? formatMinutes(weeklyStats.thisWeek.totalTime) : "0m",
      change: weeklyStats?.changes.totalTime || 0,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Sessions",
      value: weeklyStats?.thisWeek.sessions || 0,
      change: weeklyStats?.changes.sessions || 0,
      icon: Target,
      color: "text-green-500",
    },
    {
      label: "Tasks Done",
      value: weeklyStats?.thisWeek.tasksCompleted || 0,
      change: weeklyStats?.changes.tasksCompleted || 0,
      icon: CheckCircle,
      color: "text-orange-500",
    },
    {
      label: "Questions",
      value: weeklyStats?.thisWeek.questionsAnswered || 0,
      change: weeklyStats?.changes.questionsAnswered || 0,
      icon: MessageSquare,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.change > 0;
        const isNegative = stat.change < 0;

        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isPositive && "text-green-600",
                    isNegative && "text-red-600",
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(stat.change)}% from last week</span>
                </div>
              )}
              {stat.change === 0 && (
                <p className="text-xs text-muted-foreground">
                  Same as last week
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
