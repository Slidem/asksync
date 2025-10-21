"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { useMemo } from "react";

export function MonthViewHeader() {
  const weekdays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek(new Date()), i);
      return format(date, "EEE");
    });
  }, []);

  return (
    <div className="border-border/70 grid grid-cols-7 border-b">
      {weekdays.map((day) => (
        <div
          key={day}
          className="text-muted-foreground/70 py-2 text-center text-sm"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
