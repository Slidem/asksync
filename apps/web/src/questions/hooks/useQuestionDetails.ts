import { convertConvexQuestion, toQuestionId } from "@/lib/convexTypes";

import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";

export function useQuestionDetails(questionId: string) {
  const { user } = useUser();
  const rawQuestion = useQuery(api.questions.queries.getQuestionById, {
    questionId: toQuestionId(questionId),
  });

  const question = rawQuestion ? convertConvexQuestion(rawQuestion) : null;

  const isLoading = rawQuestion === undefined;
  const isAssignee = user?.id && question?.assigneeIds.includes(user.id);
  const isParticipant = user?.id && question?.participantIds?.includes(user.id);
  const isCreator = user?.id === question?.createdBy;

  return {
    question,
    isLoading,
    isAssignee: !!isAssignee,
    isParticipant: !!isParticipant,
    isCreator: !!isCreator,
  };
}
