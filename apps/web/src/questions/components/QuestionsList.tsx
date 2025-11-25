import { Card, CardContent } from "@/components/ui/card";

import { MessageCircleQuestionMark } from "lucide-react";
import { Question } from "@asksync/shared";
import { QuestionCard } from "./QuestionCard";
import { useUser } from "@clerk/nextjs";

interface QuestionsListProps {
  questions: Question[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
}

export function QuestionsList({
  questions,
  isLoading,
  emptyMessage,
}: QuestionsListProps) {
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading questions...</span>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8">
          <div className="text-center">
            <MessageCircleQuestionMark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          currentUserId={user?.id}
        />
      ))}
    </div>
  );
}
