import { api } from "@/../../backend/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Hook to get current active timeblocks with tasks
 */
export function useCurrentTimeblock() {
  const timeblockData = useQuery(
    api.workSessions.queries.timeblock.getCurrentTimeblocks,
    {},
  );

  return {
    timeblockData,
    isLoading: timeblockData === undefined,
    hasTimeblocks: timeblockData && timeblockData.timeblocks.length > 0,
  };
}
