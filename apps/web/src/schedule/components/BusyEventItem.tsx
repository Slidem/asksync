"use client";

import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";

import { cn } from "@/lib/utils";
import { getBorderRadiusClasses } from "@/schedule/utils";
import { useMemo } from "react";

const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
};

interface BusyEventItemProps {
  start: Date;
  end: Date;
  view: "month" | "week" | "day" | "agenda";
  isFirstDay?: boolean;
  isLastDay?: boolean;
  className?: string;
}

/**
 * BusyEventItem renders a minimal "Busy" block for events the user
 * doesn't have permission to view. Not clickable, no details shown.
 */
export function BusyEventItem({
  start,
  end,
  view,
  isFirstDay = true,
  isLastDay = true,
  className,
}: BusyEventItemProps) {
  const isEventInPast = isPast(end);

  const durationMinutes = useMemo(() => {
    return differenceInMinutes(end, start);
  }, [start, end]);

  const eventTime = useMemo(() => {
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(start);
    }
    return `${formatTimeWithOptionalMinutes(start)} - ${formatTimeWithOptionalMinutes(end)}`;
  }, [durationMinutes, start, end]);

  const baseClasses = cn(
    // Gray/muted styling for busy blocks
    "bg-muted/50 text-muted-foreground border border-muted-foreground/20",
    // Not clickable
    "cursor-default select-none",
    // Common styling
    "backdrop-blur-md",
    getBorderRadiusClasses(isFirstDay, isLastDay),
  );

  if (view === "month") {
    return (
      <div
        className={cn(
          baseClasses,
          "mt-[var(--event-gap)] h-[var(--event-height)] flex items-center px-1 text-[10px] sm:px-2 sm:text-xs",
          isEventInPast && "opacity-60",
          className,
        )}
      >
        <span className="truncate italic">Busy</span>
      </div>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <div
        className={cn(
          baseClasses,
          "size-full py-1 px-1 sm:px-2",
          durationMinutes < 45 ? "flex items-center" : "flex flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          isEventInPast && "opacity-60",
          className,
        )}
      >
        {durationMinutes < 45 ? (
          <span className="truncate italic">Busy</span>
        ) : (
          <>
            <div className="truncate font-medium italic">Busy</div>
            <div className="truncate font-normal opacity-70 text-[10px] sm:text-[11px]">
              {eventTime}
            </div>
          </>
        )}
      </div>
    );
  }

  // Agenda view
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1 rounded p-2 text-left",
        "bg-muted/50 text-muted-foreground border border-muted-foreground/20",
        isEventInPast && "opacity-60",
        className,
      )}
    >
      <div className="text-sm font-medium italic">Busy</div>
      <div className="text-xs opacity-70 uppercase">{eventTime}</div>
    </div>
  );
}
