"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionPage } from "@/questions/QuestionPage";
import { Id } from "@/../../backend/convex/_generated/dataModel";

interface QuestionThreadModalProps {
  questionId: Id<"questions"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionThreadModal({
  questionId,
  open,
  onOpenChange,
}: QuestionThreadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Thread</DialogTitle>
        </DialogHeader>
        {questionId && <QuestionPage questionId={questionId} mode="compact" />}
      </DialogContent>
    </Dialog>
  );
}
