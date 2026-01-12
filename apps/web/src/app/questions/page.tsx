"use client";

import { JSX } from "react";
import { ActiveTagFilters } from "@/questions/components/ActiveTagFilters";
import { CreateQuestionDialog } from "@/questions/dialogs/createQuestion/CreateQuestionDialog";
import { QuestionsFiltersBar } from "@/questions/components/QuestionsFiltersBar";
import { QuestionsList } from "@/questions/components/QuestionsList";
import { QuestionsPageHeader } from "@/questions/components/QuestionsPageHeader";
import { QuestionsTabs } from "@/questions/components/QuestionsTabs";
import { TabsContent } from "@/components/ui/tabs";
import { useCreateQuestionDialogStore } from "@/questions/dialogs/createQuestion/createQuestionDialogStore";
import { useQuestionsPage } from "@/questions/hooks/useQuestionsPage";

export default function QuestionsPage(): JSX.Element {
  const { openDialog } = useCreateQuestionDialogStore();
  const {
    activeTab,
    setActiveTab,
    filters,
    handleFilterChange,
    questions,
    isLoading,
    stats,
    tags,
    handleRemoveTag,
    handleClearAllTags,
  } = useQuestionsPage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        <QuestionsPageHeader onAskQuestion={openDialog} />
        <CreateQuestionDialog />

        <QuestionsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        >
          <div className="space-y-6">
            <QuestionsFiltersBar
              filters={filters}
              tags={tags}
              onFilterChange={handleFilterChange}
            />

            <ActiveTagFilters
              selectedTagIds={filters.tagIds || []}
              tags={tags}
              onRemoveTag={handleRemoveTag}
              onClearAll={handleClearAllTags}
            />

            <TabsContent value="assigned" className="space-y-4 mt-0">
              <QuestionsList
                questions={questions}
                isLoading={isLoading}
                emptyMessage="No questions assigned to you yet."
              />
            </TabsContent>

            <TabsContent value="created" className="space-y-4 mt-0">
              <QuestionsList
                questions={questions}
                isLoading={isLoading}
                emptyMessage="You haven't asked any questions yet."
              />
            </TabsContent>

            <TabsContent value="participating" className="space-y-4 mt-0">
              <QuestionsList
                questions={questions}
                isLoading={isLoading}
                emptyMessage="You're not participating in any questions yet."
              />
            </TabsContent>
          </div>
        </QuestionsTabs>
      </div>
    </div>
  );
}
