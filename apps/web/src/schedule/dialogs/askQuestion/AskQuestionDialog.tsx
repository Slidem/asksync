"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAskQuestionDialogStore } from "./askQuestionDialogStore";
import { TimeblockInfoDisplay } from "./components/TimeblockInfoDisplay";
import { QuestionFormSection } from "./components/QuestionFormSection";
import { useCallback, useState } from "react";
import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AskQuestionDialog: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isOpen,
    closeDialog,
    timeblockId,
    assigneeUserId,
    tagIds,
    questionTitle,
    questionContent,
    createdQuestionId,
    setCreatedQuestionId,
  } = useAskQuestionDialogStore();

  const createQuestionMutation = useMutation(
    api.questions.mutations.createQuestion,
  );

  // Fetch timeblock data to display event info
  const timeblocks = useQuery(api.timeblocks.queries.listTimeblocks, {
    userId: assigneeUserId || undefined,
  });

  const currentTimeblock = timeblocks?.find((tb) => tb._id === timeblockId);

  const handleSubmit = useCallback(async () => {
    if (!assigneeUserId || tagIds.length === 0) {
      toast.error("Cannot create question - missing assignee or tags");
      return;
    }

    if (!questionTitle.trim() || !questionContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      const questionId = await createQuestionMutation({
        title: questionTitle,
        content: questionContent,
        tagIds,
        assigneeIds: [assigneeUserId],
        participants: [],
      });

      setCreatedQuestionId(questionId);
      toast.success("Question created successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create question",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    assigneeUserId,
    tagIds,
    questionTitle,
    questionContent,
    createQuestionMutation,
    setCreatedQuestionId,
  ]);

  const handleViewQuestion = () => {
    if (createdQuestionId) {
      router.push(`/questions/${createdQuestionId}`);
      closeDialog();
    }
  };

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  // Convert timeblock to CalendarEvent for display
  const event = currentTimeblock
    ? {
        id: currentTimeblock._id,
        title: currentTimeblock.title,
        description: currentTimeblock.description,
        start: new Date(currentTimeblock.startTime),
        end: new Date(currentTimeblock.endTime),
        allDay: false,
        location: currentTimeblock.location,
        tagIds: currentTimeblock.tagIds,
        permissions: [],
      }
    : null;

  // Validation: Check if timeblock has no tags
  const hasNoTags = tagIds.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Timeblock</DialogTitle>
          <DialogDescription>
            {hasNoTags
              ? "Timeblock details"
              : "Ask a question and get a response during this timeblock"}
          </DialogDescription>
        </DialogHeader>

        {createdQuestionId ? (
          // Success State
          <div className="space-y-4 py-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Question Created!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your question has been successfully created
                </p>
              </div>
              <Button onClick={handleViewQuestion} className="gap-2">
                View Question
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Normal State
          <div className="space-y-4 py-4">
            {/* Info Message */}
            {hasNoTags ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No tags associated with this timeblock - questions require
                  tags to be created
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ask a question and the user will get back to you during this
                  timeblock
                </AlertDescription>
              </Alert>
            )}

            {/* Timeblock Info */}
            {event && <TimeblockInfoDisplay event={event} />}

            {/* Question Form - Only show if has tags */}
            {!hasNoTags && (
              <div className="pt-2 border-t">
                <QuestionFormSection
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
