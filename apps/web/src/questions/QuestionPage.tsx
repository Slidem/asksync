"use client";

import { docToMessage, toQuestionId, toThreadId } from "@/lib/convexTypes";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiscussionThread } from "./components/DiscussionThread";
import Link from "next/link";
import { QuestionDetails } from "./components/QuestionDetails";
import { QuestionPageHeader } from "./components/QuestionPageHeader";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useDeleteQuestion } from "@/questions/hooks/mutations";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { useQuestionDetails } from "./hooks/useQuestionDetails";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function QuestionPage({
  questionId,
  mode = "full",
}: {
  questionId: string;
  mode?: "full" | "compact";
}) {
  const { user } = useUser();
  const router = useRouter();
  const { question, isLoading, isAssignee, isParticipant, isCreator } =
    useQuestionDetails(questionId);
  const { deleteQuestion } = useDeleteQuestion();

  const rawMessages = useQuery(
    api.messages.queries.getMessagesByThread,
    question?.threadId ? { threadId: toThreadId(question.threadId) } : "skip",
  );
  const messages = rawMessages?.map(docToMessage);

  const resolveQuestion = useMutation(api.questions.mutations.resolveQuestion);
  const markAsRead = useMutation(api.questions.mutations.markQuestionAsRead);

  // Mark as read when viewing
  useEffect(() => {
    if (question && question.unreadBy.includes(user?.id || "")) {
      markAsRead({ questionId: toQuestionId(questionId) });
    }
  }, [question, markAsRead, questionId, user?.id]);

  const handleResolveQuestion = async () => {
    if (!isAssignee) {
      toast.error("Only assignees can resolve questions");
      return;
    }

    try {
      await resolveQuestion({ questionId: toQuestionId(questionId) });
      toast.success("Question resolved!");
    } catch (error) {
      console.error("Error resolving question:", error);
      toast.error("Failed to resolve question");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question) return;
    await deleteQuestion({
      ...question,
      messageCount: 0,
      hasUnread: false,
    });
    router.push("/questions");
  };

  const containerClass =
    mode === "compact" ? "bg-background" : "min-h-screen bg-background";
  const innerClass =
    mode === "compact"
      ? "mx-auto max-w-3xl"
      : "container mx-auto max-w-3xl p-6";

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Question Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The question you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link href="/questions">
              <Button>Back to Questions</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        {mode === "full" && <QuestionPageHeader />}

        <Card className="p-6 border-primary/20">
          <QuestionDetails
            title={question.title}
            content={question.content}
            status={question.status}
            expectedAnswerTime={question.expectedAnswerTime}
            tags={question.tags}
            participants={question.participants}
            createdAt={question.createdAt}
            isAssignee={isAssignee}
            isCreator={isCreator}
            onResolve={handleResolveQuestion}
            onDelete={handleDeleteQuestion}
            mode={mode}
          />
        </Card>

        <Card className="p-6 border-primary/20 mt-6">
          <DiscussionThread
            threadId={question.threadId}
            questionId={questionId}
            messages={messages || []}
            isAssignee={isAssignee}
            isParticipant={isParticipant}
            isResolved={question.status === "resolved"}
          />
        </Card>
      </div>
    </div>
  );
}
