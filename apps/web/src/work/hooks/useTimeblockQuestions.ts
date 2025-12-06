import { Id } from "@convex/dataModel";
import { api } from "@convex/api";
import { useQuery } from "convex/react";

export const useTimeblockQuestions = (
  timeblockId?: Id<"timeblocks"> | null,
) => {
  const questions = useQuery(
    api.workSessions.queries.questions.getTimeblockQuestions,
    timeblockId ? { timeblockId } : {},
  );

  return {
    isLoading: questions === undefined,
    questions: questions || [],
  };
};
