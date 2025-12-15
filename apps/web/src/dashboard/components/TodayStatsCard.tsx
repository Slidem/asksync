"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, MessageSquare, Target } from "lucide-react";

interface TodayStatsCardProps {
  sessionStats?: {
    totalFocusTime: number;
    totalSessions: number;
    totalTasks: number;
    totalQuestions: number;
    currentStreak: number;
  } | null;
}

export function TodayStatsCard({ sessionStats }: TodayStatsCardProps) {
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
      value: sessionStats ? formatMinutes(sessionStats.totalFocusTime) : "0m",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Sessions",
      value: sessionStats?.totalSessions || 0,
      icon: Target,
      color: "text-green-500",
    },
    {
      label: "Tasks Done",
      value: sessionStats?.totalTasks || 0,
      icon: CheckCircle,
      color: "text-orange-500",
    },
    {
      label: "Questions",
      value: sessionStats?.totalQuestions || 0,
      icon: MessageSquare,
      color: "text-purple-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
