"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Flame } from "lucide-react";

interface StreakCardProps {
  sessionStats?: {
    currentStreak: number;
  } | null;
}

export function StreakCard({ sessionStats }: StreakCardProps): React.ReactNode {
  const streak = sessionStats?.currentStreak || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Current Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-6xl font-bold">{streak}</span>
            <Flame className="h-12 w-12 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            {streak === 1 ? "day" : "days"} streak
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
