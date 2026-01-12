import { MessageCircleQuestionMark, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuestionsPageHeaderProps {
  onAskQuestion: () => void;
}

export function QuestionsPageHeader({
  onAskQuestion,
}: QuestionsPageHeaderProps): React.ReactNode {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <MessageCircleQuestionMark className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Questions</h1>
      </div>
      <Button onClick={onAskQuestion} size="icon" className="sm:w-auto sm:px-4">
        <Plus className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Ask Question</span>
      </Button>
    </div>
  );
}
