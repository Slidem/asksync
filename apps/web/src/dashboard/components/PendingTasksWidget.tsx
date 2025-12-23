"use client";

import { AlertTriangle, ChevronRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UrgentQuestion {
  _id: string;
  title: string;
  contentPlaintext?: string;
  expectedAnswerTime: number;
  isOverdue: boolean;
  matchesCurrentBlock: boolean;
  tags: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  threadId: string;
}

interface PendingTasksWidgetProps {
  urgentQuestions?: UrgentQuestion[] | null;
}

function QuestionItem({
  question,
  onClick,
}: {
  question: UrgentQuestion;
  onClick: () => void;
}) {
  const getUrgencyText = () => {
    if (question.isOverdue) return "Overdue";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m left`;
    if (hoursUntil < 24) return `${Math.round(hoursUntil)}h left`;
    const daysUntil = Math.round(hoursUntil / 24);
    return `${daysUntil}d left`;
  };

  const getUrgencyColor = () => {
    if (question.isOverdue) return "text-red-500";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return "text-orange-500";
    if (hoursUntil < 4) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <button
      className={cn(
        "w-full text-left rounded-xl p-4 transition-all cursor-pointer",
        "bg-card shadow-sm hover:shadow-md",
        question.isOverdue &&
          "ring-2 ring-red-500/50 bg-red-50/30 dark:bg-red-950/10",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {question.isOverdue ? (
              <AlertTriangle
                className={cn("h-4 w-4 flex-shrink-0", getUrgencyColor())}
              />
            ) : (
              <Clock
                className={cn("h-4 w-4 flex-shrink-0", getUrgencyColor())}
              />
            )}
            <span className={cn("text-sm font-medium", getUrgencyColor())}>
              {getUrgencyText()}
            </span>
          </div>
          <h4 className="font-medium text-sm line-clamp-2 mb-2">
            {question.title}
          </h4>
          {question.contentPlaintext && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {question.contentPlaintext}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {question.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag._id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{question.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-1" />
      </div>
    </button>
  );
}

export function PendingTasksWidget({
  urgentQuestions,
}: PendingTasksWidgetProps) {
  const router = useRouter();

  if (!urgentQuestions || urgentQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4 mb-4">
          <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-medium mb-1">All caught up!</h3>
        <p className="text-sm text-muted-foreground">
          No pending questions to answer
        </p>
      </div>
    );
  }

  // Separate into current timeblock and upcoming
  const currentQuestions = urgentQuestions.filter((q) => q.matchesCurrentBlock);
  const upcomingQuestions = urgentQuestions.filter(
    (q) => !q.matchesCurrentBlock,
  );

  const handleQuestionClick = (question: UrgentQuestion) => {
    router.push(`/questions?thread=${question.threadId}`);
  };

  return (
    <div className="space-y-8">
      {/* Current Timeblock Section */}
      {currentQuestions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Current Timeblock
            </h2>
            <Badge variant="secondary" className="ml-auto">
              {currentQuestions.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {currentQuestions.map((question) => (
              <QuestionItem
                key={question._id}
                question={question}
                onClick={() => handleQuestionClick(question)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {upcomingQuestions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming
            </h2>
            <Badge variant="secondary" className="ml-auto">
              {upcomingQuestions.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {upcomingQuestions.map((question) => (
              <QuestionItem
                key={question._id}
                question={question}
                onClick={() => handleQuestionClick(question)}
              />
            ))}
          </div>
        </section>
      )}

      {/* View All Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/questions")}
      >
        View All Questions
      </Button>
    </div>
  );
}
