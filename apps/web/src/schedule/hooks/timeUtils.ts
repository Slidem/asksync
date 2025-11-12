import { END_HOUR, START_HOUR } from "@/schedule/constants";
import {
  addHours,
  eachHourOfInterval,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";

/**
 * Custom hook to generate hour intervals for calendar grid
 * Returns an array of Date objects representing each hour in the grid
 */
export function useHourGrid(date: Date): Date[] {
  return useMemo(() => {
    const dayStart = startOfDay(date);
    return eachHourOfInterval({
      start: addHours(dayStart, START_HOUR),
      end: addHours(dayStart, END_HOUR - 1),
    });
  }, [date]);
}

export function useCurrentTimeIndicator(
  currentDate: Date,
  view: "day" | "week",
) {
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = (hours - START_HOUR) * 60 + minutes;
      const dayStartMinutes = 0; // 12am
      const dayEndMinutes = (END_HOUR - START_HOUR) * 60; // 12am next day

      // Calculate position as percentage of day
      const position =
        ((totalMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes)) *
        100;

      // Check if current day is in view based on the calendar view
      let isCurrentTimeVisible = false;

      if (view === "day") {
        isCurrentTimeVisible = isSameDay(now, currentDate);
      } else if (view === "week") {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        isCurrentTimeVisible = isWithinInterval(now, {
          start: startOfWeekDate,
          end: endOfWeekDate,
        });
      }

      setCurrentTimePosition(position);
      setCurrentTimeVisible(isCurrentTimeVisible);
    };

    // Calculate immediately
    calculateTimePosition();

    // Update every minute
    const interval = setInterval(calculateTimePosition, 60000);

    return () => clearInterval(interval);
  }, [currentDate, view]);

  return { currentTimePosition, currentTimeVisible };
}
