import { Question } from "@asksync/shared";

import { api } from "@convex/api";
import { toQuestionId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useMutation } from "convex/react";

export const useDeleteQuestion = () => {
  const deleteQuestionMutation = useMutation(
    api.questions.mutations.deleteQuestion,
  );
  const deleteQuestion = async (question: Question) => {
    if (
      !confirm(
        `Are you sure you want to delete the question "${question.title}"?`,
      )
    ) {
      return false;
    }

    try {
      await deleteQuestionMutation({ questionId: toQuestionId(question.id) });
      toast.success("Question deleted successfully");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete question",
      );
      return false;
    }
  };
  return { deleteQuestion };
};
