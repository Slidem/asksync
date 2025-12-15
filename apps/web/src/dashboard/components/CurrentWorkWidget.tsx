"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { QuickStartButton } from "./QuickStartButton";
import { formatTime } from "@/work/utils/formatting";

interface CurrentWorkWidgetProps {
  activeSession?: {
    sessionType: "work" | "shortBreak" | "longBreak";
    focusMode: string;
    currentTaskId?: string;
    currentQuestionId?: string;
    expectedEndAt?: number;
    status: string;
  } | null;
}

export function CurrentWorkWidget({ activeSession }: CurrentWorkWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!activeSession?.expectedEndAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTime = () => {
      const remaining = Math.max(0, activeSession.expectedEndAt! - Date.now());
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.expectedEndAt]);

  const sessionTypeLabels = {
    work: "Work Session",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  const focusModeLabels: Record<string, string> = {
    deep: "Deep Focus",
    normal: "Normal Focus",
    quick: "Quick Focus",
    review: "Review",
    custom: "Custom",
  };

  if (!activeSession || activeSession.status !== "active") {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Current Work Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">No active work session</p>
            <QuickStartButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Current Work Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {sessionTypeLabels[activeSession.sessionType]}
              </p>
              <p className="text-2xl font-bold">
                {timeRemaining !== null
                  ? formatTime(Math.floor(timeRemaining / 1000))
                  : "--:--"}
              </p>
              <p className="text-sm text-muted-foreground">
                {focusModeLabels[activeSession.focusMode] ||
                  activeSession.focusMode}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
