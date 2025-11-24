import { api } from "@convex/api";
import { useOneWeekDateRange } from "@/lib/time";
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

  const timeblocks = useQuery(api.timeblocks.queries.getAvailableTimeblocks, {
    userId,
    tagIds,
    startDate,
    endDate,
  });

  return timeblocks || [];
}
