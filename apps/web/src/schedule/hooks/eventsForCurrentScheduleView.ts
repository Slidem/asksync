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
  const rawTimeblocks = useQuery(api.timeblocks.queries.listTimeblocks, {});
  const timeblocks: Timeblock[] = useMemo(
    () => (rawTimeblocks || []).map(docToTimeblock),
    [rawTimeblocks],
  );

  // Fetch permissions for all timeblocks
  const timeblockPermissions = useQuery(
    api.permissions.queries.getMyPermissions,
    {},
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

    const events = expandRecurringEvents(timeblocks, start, end);

    // Add permission info to events if permissions are loaded
    if (timeblockPermissions) {
      const permissionMap = new Map(
        timeblockPermissions.timeblockPermissions.map(
          (p: { resourceId: string; canEdit: boolean; canDelete: boolean }) => [
            p.resourceId,
            p,
          ],
        ),
      );

      return events.map((event) => {
        const perm = permissionMap.get(event.id);
        if (perm && event.source === "asksync") {
          return {
            ...event,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
          };
        }
        return event;
      });
    }

    return events;
  }, [currentDate, view, timeblocks, timeblockPermissions]);
};
