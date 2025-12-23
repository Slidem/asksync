import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { useAskQuestionDialogStore } from "../askQuestionDialogStore";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquarePlus } from "lucide-react";
import { TagDetailsDisplay } from "./TagDetailsDisplay";

interface QuestionFormSectionProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const QuestionFormSection = ({
  onSubmit,
  isSubmitting,
}: QuestionFormSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const questionTitle = useAskQuestionDialogStore(
    (state) => state.questionTitle,
  );
  const questionContent = useAskQuestionDialogStore(
    (state) => state.questionContent,
  );
  const tagIds = useAskQuestionDialogStore((state) => state.tagIds);
  const setQuestionTitle = useAskQuestionDialogStore(
    (state) => state.setQuestionTitle,
  );
  const setQuestionContent = useAskQuestionDialogStore(
    (state) => state.setQuestionContent,
  );

  const canSubmit =
    questionTitle.trim().length > 0 && questionContent.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Ask a Question</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Tags Info - Simple Pills */}
          <TagDetailsDisplay
            tagIds={tagIds}
            title="Question will be tagged with:"
            variant="simple"
          />

          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="question-title">Question Title *</Label>
            <Input
              id="question-title"
              placeholder="What would you like to ask?"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <Label htmlFor="question-content">Question Details *</Label>
            <TiptapEditor
              value={questionContent}
              onChange={(html, plaintext) =>
                setQuestionContent(html, plaintext)
              }
              placeholder="Provide more details about your question..."
              minHeight={100}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating Question..." : "Create Question"}
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
};
