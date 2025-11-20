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

const getMonthViewRange = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  return {
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  };
};

const getWeekViewRange = (currentDate: Date) => {
  return {
    start: startOfWeek(currentDate, { weekStartsOn: 0 }),
    end: endOfWeek(currentDate, { weekStartsOn: 0 }),
  };
};

const getDayViewRange = (currentDate: Date) => {
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

const getAgendaViewRange = (currentDate: Date) => {
  return {
    start: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    ),
    end: addDays(currentDate, 14),
  };
};

const getDefaultViewRange = (currentDate: Date) => {
  return {
    start: currentDate,
    end: currentDate,
  };
};

export const useEventsForCurrentScheduleView = () => {
  const view = useCalendarViewStore((state) => state.calendarView);
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);
  const rawTimeblocks = useQuery(api.timeblocks.queries.listTimeblocks, {
    userId: selectedUserId ?? undefined,
  });
  const timeblocks: Timeblock[] = useMemo(
    () => (rawTimeblocks || []).map(docToTimeblock),
    [rawTimeblocks],
  );

  return useMemo(() => {
    const getViewRange = () => {
      switch (view) {
        case "month":
          return getMonthViewRange(currentDate);
        case "week":
          return getWeekViewRange(currentDate);
        case "day":
          return getDayViewRange(currentDate);
        case "agenda":
          return getAgendaViewRange(currentDate);
        default:
          return getDefaultViewRange(currentDate);
      }
    };

    const { start, end } = getViewRange();

    return expandRecurringEvents(timeblocks, start, end);
  }, [currentDate, view, timeblocks]);
};
