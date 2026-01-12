"use client";

import { differenceInMinutes, format } from "date-fns";

import React from "react";
import { cn } from "@/lib/utils";

interface GhostEventProps {
  startTime: Date;
  endTime: Date;
  view: "day" | "week" | "month";
  className?: string;
  isDragging?: boolean;
}

export function GhostEvent({
  startTime,
  endTime,
  view,
  className,
  isDragging = false,
}: GhostEventProps): React.ReactNode {
  const duration = differenceInMinutes(endTime, startTime);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const formatDuration = () => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatTimeRange = () => {
    return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
  };

  if (view === "month") {
    return (
      <div
        className={cn(
          "pointer-events-none select-none rounded-md border-2 border-dashed px-1.5 py-0.5 text-xs",
          "border-blue-400 bg-blue-50 text-blue-700",
          "dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300",
          isDragging && "border-solid bg-blue-100 dark:bg-blue-950/70",
          className,
        )}
      >
        <div className="truncate font-medium">New Event</div>
      </div>
    );
  }

  // Day or Week view
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none rounded-md border-2",
        "border-dashed border-blue-400 bg-blue-50/80",
        "dark:border-blue-500 dark:bg-blue-950/40",
        isDragging && "border-solid bg-blue-100/90 dark:bg-blue-950/60",
        "flex flex-col p-2 transition-all duration-150",
        className,
      )}
    >
      <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
        New Event
      </div>
      <div className="mt-auto flex flex-col gap-0.5">
        <div className="text-[10px] text-blue-600 dark:text-blue-400">
          {formatTimeRange()}
        </div>
        <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
          {formatDuration()}
        </div>
      </div>
    </div>
  );
}
