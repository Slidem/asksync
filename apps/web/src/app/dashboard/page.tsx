"use client";

import { useQuery } from "convex/react";

import { AttentionItemsSection } from "@/dashboard/components/AttentionItemsSection";
import { PendingTasksWidget } from "@/dashboard/components/PendingTasksWidget";
import { api } from "@convex/api";

export default function Page() {
  const urgentQuestions = useQuery(api.questions.queries.getUrgentQuestions, {
    limit: 10,
  });

  const urgentAttentionItems = useQuery(
    api.gmail.queries.getUrgentAttentionItems,
    { limit: 5 },
  );

  const isLoading =
    urgentQuestions === undefined || urgentAttentionItems === undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
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
