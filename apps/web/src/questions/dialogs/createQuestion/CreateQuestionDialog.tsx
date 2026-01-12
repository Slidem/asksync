import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EnterQuestionStep } from "./EnterQuestionStep";
import { SelectAvailabilityStep } from "./SelectAvailabilityStep";
import { SelectUserStep } from "./SelectUserStep";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateQuestionDialog(): React.ReactNode {
  const router = useRouter();
  const {
    isOpen,
    step,
    closeDialog,
    reset,
    selectedUserIds,
    selectedTagIds,
    questionTitle,
    questionContent,
    questionContentPlaintext,
  } = useCreateQuestionDialogStore();
  const createQuestion = useMutation(api.questions.mutations.createQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      closeDialog();
      // Reset after animation completes
      setTimeout(reset, 200);
    }
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!questionTitle.trim()) {
      toast.error("Question title is required");
      return;
    }

    if (selectedTagIds.length === 0) {
      toast.error("At least one tag is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const questionId = await createQuestion({
        title: questionTitle,
        content: questionContent,
        contentPlaintext: questionContentPlaintext,
        tagIds: selectedTagIds,
        assigneeIds: selectedUserIds,
        participants: [],
      });

      toast.success("Question created successfully!");
      handleClose();
      router.push(`/questions/${questionId}`);
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Select People";
      case 2:
        return "Select Tags";
      case 3:
        return "Enter Question";
      default:
        return "Create Question";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
          {/* Step Progress */}
          <div className="flex items-center gap-0 w-full pt-4">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all shrink-0 ${
                    s === step
                      ? "bg-primary ring-4 ring-primary/20 scale-110"
                      : s < step
                        ? "bg-primary/60"
                        : "bg-muted"
                  }`}
                />
                {idx < 2 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s < step ? "bg-primary/50" : "bg-muted"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="pt-6">
          {step === 1 && <SelectUserStep />}
          {step === 2 && <SelectAvailabilityStep />}
          {step === 3 && (
            <EnterQuestionStep
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
