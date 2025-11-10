import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { Timeblock } from "@asksync/shared";
import { api } from "@convex/api";
import { docToTimeblock } from "@/lib/convexTypes";
import { expandRecurringEvents } from "@/schedule/utils";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useMemo } from "react";
import { useQuery } from "convex/react";

export const useEventsForCurrentScheduleView = () => {
  const currentView = useCalendarViewStore((state) => state.calendarView);
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const rawTimeblocks = useQuery(api.timeblocks.queries.listTimeblocks, {});
  const timeblocks: Timeblock[] = useMemo(
    () => (rawTimeblocks || []).map(docToTimeblock),
    [rawTimeblocks],
  );

  return useMemo(() => {
    const getMonthViewRange = () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return {
        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
      };
    };

    const getWeekViewRange = () => {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      };
    };

    const getDayViewRange = () => {
      return {
        start: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        ),
        end: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          23,
          59,
          59,
        ),
      };
    };

    const getAgendaViewRange = () => {
      return {
        start: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        ),
        end: addDays(currentDate, 14),
      };
    };

    const getDefaultViewRange = () => {
      return {
        start: currentDate,
        end: currentDate,
      };
    };

    const getViewRange = () => {
      switch (currentView) {
        case "month":
          return getMonthViewRange();
        case "week":
          return getWeekViewRange();
        case "day":
          return getDayViewRange();
        case "agenda":
          return getAgendaViewRange();
        default:
          return getDefaultViewRange();
      }
    };

    const { start, end } = getViewRange();

    return expandRecurringEvents(timeblocks, start, end);
  }, [currentDate, currentView, timeblocks]);
};
