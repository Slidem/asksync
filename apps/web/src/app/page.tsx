"use client";

import { PendingTasksWidget } from "@/dashboard/components/PendingTasksWidget";
import { api } from "@convex/api";
import { useQuery } from "convex/react";

export default function Home() {
  const urgentQuestions = useQuery(api.questions.queries.getUrgentQuestions, {
    limit: 10,
  });

  const isLoading = urgentQuestions === undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <PendingTasksWidget urgentQuestions={urgentQuestions} />
      )}
    </div>
  );
}
