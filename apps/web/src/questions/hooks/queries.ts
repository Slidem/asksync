import { api } from "@convex/api";
import { docToCalendarEvent } from "@/lib/convexTypes";
import { useMemo } from "react";
import { useOneWeekDateRange } from "@/lib/date";
import { useQuery } from "convex/react";

interface UseAvailableTimeblocksParams {
  userId: string;
  tagIds: string[];
}

export function useAvailableTimeblocksForUserAndTags({
  userId,
  tagIds,
}: UseAvailableTimeblocksParams) {
  const { startDate, endDate } = useOneWeekDateRange();

  const rawTimeblocks = useQuery(
    api.timeblocks.queries.getAvailableTimeblocks,
    {
      userId,
      tagIds,
      startDate,
      endDate,
    },
  );

  return useMemo(() => {
    const calendarEvents = (rawTimeblocks || []).map((tb) =>
      docToCalendarEvent({ ...tb, permissions: [], tasks: null }),
    );

    const currentDate = new Date();

    return {
      timeblocks: calendarEvents.filter(
        (tb) => tb.end.getTime() > currentDate.getTime(),
      ),
      isLoading: rawTimeblocks === undefined,
    };
  }, [rawTimeblocks]);
}
