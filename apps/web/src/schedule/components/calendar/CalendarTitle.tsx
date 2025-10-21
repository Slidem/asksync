"use client";

import { AgendaDaysToShow } from "@/schedule/constants";
import { addDays, endOfWeek, format, isSameMonth, startOfWeek } from "date-fns";
import { useCalendarNavigation, useCalendarView } from "@/schedule/stores";
import { useMemo } from "react";

/**
 * Calendar title component
 * Displays the current date range based on view mode
 */
export function CalendarTitle() {
  const { currentDate } = useCalendarNavigation();
  const { view } = useCalendarView();

  const viewTitle = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }

    if (view === "day") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span
            className="max-[479px]:hidden min-md:hidden"
            aria-hidden="true"
          >
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      );
    }

    if (view === "agenda") {
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }

    // Default: month view
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
      {viewTitle}
    </h2>
  );
}