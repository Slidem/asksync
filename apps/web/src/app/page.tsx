"use client";

import { AttentionItemsSection } from "@/dashboard/components/AttentionItemsSection";
import { Clock } from "lucide-react";
import { JSX } from "react";
import { PendingTasksWidget } from "@/dashboard/components/PendingTasksWidget";
import { api } from "@convex/api";
import { useQuery } from "convex/react";

export default function Home(): JSX.Element {
  const urgentQuestions = useQuery(api.questions.queries.getUrgentQuestions, {
    limit: 10,
  });

  const urgentAttentionItems = useQuery(
    api.gmail.queries.getUrgentAttentionItems,
    { limit: 5 },
  );

  const isLoading =
    urgentQuestions === undefined || urgentAttentionItems === undefined;

  const hasNoQuestions = !urgentQuestions || urgentQuestions.length === 0;
  const hasNoEmails =
    !urgentAttentionItems || urgentAttentionItems.length === 0;
  const allCaughtUp = hasNoQuestions && hasNoEmails;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : allCaughtUp ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4 mb-4">
            <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground">
            No pending questions or emails to answer
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <PendingTasksWidget urgentQuestions={urgentQuestions} />
          <AttentionItemsSection items={urgentAttentionItems} />
        </div>
      )}
    </div>
  );
}
