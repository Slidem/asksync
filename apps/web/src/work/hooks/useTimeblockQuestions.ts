import { Id } from "@convex/dataModel";
import { api } from "@convex/api";
import { useQuery } from "convex/react";

export const useTimeblockQuestions = (
  timeblockIds?: Id<"timeblocks">[],
) => {
  const questions = useQuery(
    api.workSessions.queries.questions.getTimeblockQuestions,
    timeblockIds && timeblockIds.length > 0 ? { timeblockIds } : {},
  );

  return {
    isLoading: questions === undefined,
    questions: questions || [],
  };
};
