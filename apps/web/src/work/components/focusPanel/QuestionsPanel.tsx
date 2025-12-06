"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionItem } from "./QuestionItem";
import { Inbox } from "lucide-react";

interface QuestionsPanelProps {
  questions: Array<{
    _id: string;
    title: string;
    content: string;
    expectedAnswerTime: number;
    isOverdue: boolean;
    messageCount?: number;
    createdBy: string;
    tags: Array<{
      _id: string;
      name: string;
      color: string;
    }>;
  }>;
  currentQuestionId?: string | null;
  activeSessionId?: string | null;
  onViewThread: (questionId: string) => void;
  onWorkingOn: (questionId: string) => void;
}

export function QuestionsPanel({
  questions,
  currentQuestionId,
  activeSessionId,
  onViewThread,
  onWorkingOn,
}: QuestionsPanelProps) {
  return (
    <div className="flex-1 flex flex-col">
      <h4 className="text-sm font-medium mb-4">Questions</h4>

      <ScrollArea className="flex-1 -mx-2">
        <div className="px-2">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
              <Inbox className="h-12 w-12 mb-4 opacity-20" />
              <div className="text-center">
                <div className="font-medium">No questions yet</div>
                <div className="text-xs mt-1">
                  Questions matching your current timeblock will appear here
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question) => (
                <QuestionItem
                  key={question._id}
                  question={question}
                  isActive={question._id === currentQuestionId}
                  onViewThread={() => onViewThread(question._id)}
                  onWorkingOn={() => onWorkingOn(question._id)}
                  disabled={!activeSessionId}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
