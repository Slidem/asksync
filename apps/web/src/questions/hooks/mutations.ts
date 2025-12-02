import { Question } from "@asksync/shared";

import { api } from "@convex/api";
import { toQuestionId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { confirmDialog } from "@/components/shared/ConfirmDialog";

export const useDeleteQuestion = () => {
  const deleteQuestionMutation = useMutation(
    api.questions.mutations.deleteQuestion,
  );
  const deleteQuestion = (question: Question) => {
    confirmDialog.show({
      title: "Delete question",
      description: `Are you sure you want to delete the question "${question.title}"?`,
      onConfirm: async () => {
        try {
          await deleteQuestionMutation({
            questionId: toQuestionId(question.id),
          });
          toast.success("Question deleted successfully");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete question",
          );
        }
      },
    });
  };
  return { deleteQuestion };
};
