"use client";

import { memo, useEffect, useRef, useState } from "react";

import { Timer } from "lucide-react";
import { api } from "@convex/api";
import { formatTime } from "@/work/utils/timeFormatting";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";

export const SidebarTimer = memo(function SidebarTimer() {
  const pathname = usePathname();
  const router = useRouter();
  const activeSession = useQuery(
    api.workSessions.queries.session.getActiveSession,
    {},
  );
  const [displayTime, setDisplayTime] = useState<number>(0);
  const sessionDataRef = useRef<{
    startedAt: number;
    targetDuration: number;
    pausedDuration: number;
  } | null>(null);

  const isActive = activeSession?.status === "active";

  // Store session data in ref when it changes
  useEffect(() => {
    if (isActive && activeSession) {
      sessionDataRef.current = {
        startedAt: activeSession.startedAt,
        targetDuration: activeSession.targetDuration,
        pausedDuration: activeSession.pausedDuration,
      };
    } else {
      sessionDataRef.current = null;
    }
  }, [isActive, activeSession?.startedAt, activeSession?.targetDuration, activeSession?.pausedDuration]);

  // Timer tick - only depends on isActive
  useEffect(() => {
    if (!isActive) {
      setDisplayTime(0);
      return;
    }

    const tick = () => {
      const data = sessionDataRef.current;
      if (!data) return;
      const elapsed = Date.now() - data.startedAt - data.pausedDuration;
      setDisplayTime(Math.max(0, data.targetDuration - elapsed));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Hide on work page or if no active session
  if (pathname === "/work") return null;
  if (!isActive) return null;

  const handleClick = () => {
    router.push("/work");
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 mx-2 mb-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
    >
      <Timer className="h-4 w-4 text-primary" />
      <span className="font-mono text-sm font-medium">
        {formatTime(Math.floor(displayTime / 1000))}
      </span>
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
    </button>
  );
});
