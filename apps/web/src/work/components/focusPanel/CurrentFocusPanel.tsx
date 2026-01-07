"use client";

import { memo, useMemo } from "react";

import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";
import { useTimeblockAttentionItems } from "@/emails/hooks/useTimeblockAttentionItems";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useTimeblockQuestions } from "@/work/hooks/useTimeblockQuestions";
import { EmptyState } from "@/work/components/focusPanel/EmptyState";
import { FocusPanelEmails } from "@/work/components/focusPanel/FocusPanelEmails";
import { FocusPanelQuestions } from "@/work/components/focusPanel/FocusPanelQuestions";
import { FocusPanelTasks } from "@/work/components/focusPanel/FocusPanelTasks";
import { FocusPanelTimeblocks } from "@/work/components/focusPanel/FocusPanelTimeblocks";
import { LoadingState } from "@/work/components/focusPanel/LoadingState";

export const CurrentFocusPanel = memo(function CurrentFocusPanel() {
  const { timeblockData, isLoading } = useCurrentTimeblock();
  const timeblockIds = useMemo(
    () => timeblockData?.timeblocks.map((tb) => tb._id) ?? [],
    [timeblockData?.timeblocks],
  );
  const { questions } = useTimeblockQuestions(timeblockIds);
  const { items: emailItems } = useTimeblockAttentionItems(timeblockIds);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!timeblockData || timeblockData.timeblocks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-full flex flex-col">
      <FocusPanelTimeblocks />
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <UnderlineTabs defaultValue="tasks" className="flex-1 flex flex-col">
          <UnderlineTabsList className="mb-4">
            <UnderlineTabsTrigger
              value="tasks"
              badge={timeblockData.tasks.length}
            >
              Tasks
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="questions" badge={questions.length}>
              Questions
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="emails" badge={emailItems.length}>
              Emails
            </UnderlineTabsTrigger>
          </UnderlineTabsList>

          <UnderlineTabsContent
            value="tasks"
            className="flex-1 flex flex-col mt-0"
          >
            <FocusPanelTasks />
          </UnderlineTabsContent>

          <UnderlineTabsContent
            value="questions"
            className="flex-1 flex flex-col mt-0"
          >
            <FocusPanelQuestions />
          </UnderlineTabsContent>

          <UnderlineTabsContent
            value="emails"
            className="flex-1 flex flex-col mt-0"
          >
            <FocusPanelEmails />
          </UnderlineTabsContent>
        </UnderlineTabs>
      </div>
    </div>
  );
});
