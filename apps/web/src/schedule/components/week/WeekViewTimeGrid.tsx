"use client";

import { EndHour, StartHour } from "@/schedule/constants";
import { addHours, eachHourOfInterval, format, startOfDay } from "date-fns";
import { useMemo } from "react";

interface WeekViewTimeGridProps {
  currentDate: Date;
}

export function WeekViewTimeGrid({ currentDate }: WeekViewTimeGridProps) {
  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  return (
    <div className="border-border/70 grid auto-cols-fr border-r">
      {hours.map((hour, index) => (
        <div
          key={hour.toString()}
          className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
        >
          {index > 0 && (
            <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
              {format(hour, "h a")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
