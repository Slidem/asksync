import { api } from "@/../../backend/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Hook to get the current active timeblock with tasks
 */
export function useCurrentTimeblock() {
  const timeblockData = useQuery(api.workSessions.queries.getCurrentTimeblock);

  return {
    timeblockData,
    isLoading: timeblockData === undefined,
    hasTimeblock: !!timeblockData,
  };
}
