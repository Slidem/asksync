import { api } from "@convex/api";
import { useQuery } from "convex/react";

export function useTeamStatus() {
  const teamStatus = useQuery(api.workSessions.queries.team.getTeamWorkStatus);

  return {
    teamStatus: teamStatus || [],
    isLoading: teamStatus === undefined,
  };
}
