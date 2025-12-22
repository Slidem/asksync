import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { Id } from "@convex/dataModel";
import { QuestionThreadModal } from "@/work/components/focusPanel/QuestionThreadModal";
import { QuestionsPanel } from "@/work/components/focusPanel/QuestionsPanel";
import { api } from "@convex/api";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useTimeblockQuestions } from "@/work/hooks/useTimeblockQuestions";

export const FocusPanelQuestions = () => {
  const { timeblockData } = useCurrentTimeblock();
  const { activeSessionId } =
    useQuery(api.workSessions.queries.analytics.getActiveSessionId, {}) || {};

  const updateSession = useMutation(
    api.workSessions.mutations.progress.updateSessionProgress,
  );
  const timeblockIds = React.useMemo(
    () => timeblockData?.timeblocks.map((tb) => tb._id) ?? [],
    [timeblockData?.timeblocks],
  );
  const { questions, isLoading } = useTimeblockQuestions(timeblockIds);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const handleViewThread = async (questionId: string) => {
    setSelectedQuestionId(questionId);
    if (activeSessionId) {
      await updateSession({
        sessionId: activeSessionId,
        questionId: questionId as Id<"questions">,
      });
    }
  };

  const handleCloseThread = async () => {
    setSelectedQuestionId(null);
    if (activeSessionId) {
      await updateSession({
        sessionId: activeSessionId,
        questionId: null,
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <QuestionsPanel questions={questions} onViewThread={handleViewThread} />
      <QuestionThreadModal
        questionId={selectedQuestionId as Id<"questions"> | null}
        open={!!selectedQuestionId}
        onOpenChange={(open) => {
          if (!open) handleCloseThread();
        }}
      />
    </>
  );
};
