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

export function CreateQuestionDialog() {
  const router = useRouter();
  const {
    isOpen,
    step,
    closeDialog,
    reset,
    selectedUserId,
    selectedTimeblock,
    selectedTagIds,
    questionTitle,
    questionContent,
  } = useCreateQuestionDialogStore();
  const createQuestion = useMutation(api.questions.createQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      closeDialog();
      // Reset after animation completes
      setTimeout(reset, 200);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
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
        tagIds: selectedTagIds,
        assigneeIds: [selectedUserId],
        participants: [],
        selectedTimeblockId: selectedTimeblock?.timeblockId,
        selectedTimeblockStart: selectedTimeblock?.startTime,
        selectedTimeblockEnd: selectedTimeblock?.endTime,
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
        return "Select User";
      case 2:
        return "Select Timeblock";
      case 3:
        return "Enter Question";
      default:
        return "Create Question";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
          <div className="flex items-center gap-2 pt-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    s === step
                      ? "bg-primary"
                      : s < step
                        ? "bg-primary/50"
                        : "bg-muted"
                  }`}
                />
                {s < 3 && (
                  <div
                    className={`h-0.5 w-12 ${
                      s < step ? "bg-primary/50" : "bg-muted"
                    }`}
                  />
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
