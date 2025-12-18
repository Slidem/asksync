"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { QuickStartButton } from "./QuickStartButton";
import { api } from "@convex/api";
import { formatTime } from "@/work/utils/timeFormatting";
import { useQuery } from "convex/react";

export const CurrentWorkWidget = memo(function CurrentWorkWidget() {
  const activeSession = useQuery(
    api.workSessions.queries.session.getActiveSession,
    {},
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const lastServerTime = useRef<number | null>(null);

  // Sync with server and tick locally
  useEffect(() => {
    if (activeSession === undefined) return;
    if (!activeSession || activeSession.status !== "active") {
      setTimeRemaining(null);
      lastServerTime.current = null;
      return;
    }

    // Re-sync when server value changes significantly (>2s drift or first load)
    const serverTime = activeSession.remainingTime;
    const currentTime = timeRemaining ?? 0;
    const drift = Math.abs(serverTime - currentTime);

    if (lastServerTime.current !== serverTime && (drift > 2000 || timeRemaining === null)) {
      setTimeRemaining(serverTime);
      lastServerTime.current = serverTime;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) =>
        prev !== null ? Math.max(0, prev - 1000) : null,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, timeRemaining]);

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

  // Loading state
  if (activeSession === undefined) {
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
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
});
