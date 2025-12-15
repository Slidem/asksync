"use client";

import { AlertCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function PendingTasksWidget({
  urgentQuestions,
}: PendingTasksWidgetProps) {
  const router = useRouter();

  const getUrgencyText = (question: UrgentQuestion) => {
    if (question.isOverdue) return "Overdue";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m left`;
    if (hoursUntil < 24) return `${Math.round(hoursUntil)}h left`;
    const daysUntil = Math.round(hoursUntil / 24);
    return `${daysUntil}d left`;
  };

  const getUrgencyColor = (question: UrgentQuestion) => {
    if (question.isOverdue) return "text-red-500";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return "text-orange-500";
    if (hoursUntil < 4) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Pending Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!urgentQuestions || urgentQuestions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending questions
            </p>
          ) : (
            <>
              {urgentQuestions.map((question) => (
                <button
                  key={question._id}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 transition-all cursor-pointer hover:shadow-md",
                    question.isOverdue && "border-l-4 border-l-red-500",
                    question.matchesCurrentBlock &&
                      !question.isOverdue &&
                      "border-2 border-orange-500",
                    question.matchesCurrentBlock &&
                      question.isOverdue &&
                      "border-2 border-red-500",
                  )}
                  onClick={() =>
                    router.push(`/questions?thread=${question.threadId}`)
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            getUrgencyColor(question),
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            getUrgencyColor(question),
                          )}
                        >
                          {getUrgencyText(question)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">
                        {question.title}
                      </h4>
                      {question.contentPlaintext && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {question.contentPlaintext}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag._id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: tag.color,
                              color: tag.color,
                            }}
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
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </div>
                </button>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/questions")}
              >
                View All Questions
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
