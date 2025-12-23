"use client";

import { memo } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FocusModeSelector } from "@/work/components/pomodoro/FocusModeSelector";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { getSessionLabel } from "@/work/utils/sessionUtils";

/**
 * Consolidated info bar: session type, session count, focus mode, settings
 */
export const TimerInfoBar = memo(function TimerInfoBar() {
  const { sessionType, completedWorkSessions, settings } = useWorkModeStore(
    useShallow((state) => ({
      sessionType: state.sessionType,
      completedWorkSessions: state.completedWorkSessions,
      settings: state.settings,
    })),
  );

  const sessionsBeforeLongBreak = settings?.sessionsBeforeLongBreak || 4;

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
      {/* Session type chip */}
      <div
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium",
          sessionType === "work" &&
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          sessionType === "shortBreak" &&
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          sessionType === "longBreak" &&
            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        )}
      >
        {getSessionLabel(sessionType)}
      </div>

      {/* Session count (work only) */}
      {sessionType === "work" && (
        <>
          <Separator orientation="vertical" className="h-5 hidden md:block" />
          <span className="text-sm text-muted-foreground">
            {completedWorkSessions + 1}/{sessionsBeforeLongBreak}
          </span>
        </>
      )}

      <Separator orientation="vertical" className="h-5 hidden md:block" />

      {/* Focus mode selector (compact) */}
      <FocusModeSelector compact />

      <Separator orientation="vertical" className="h-5 hidden md:block" />

      {/* Settings button */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});
