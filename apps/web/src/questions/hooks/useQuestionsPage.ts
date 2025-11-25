import { QuestionFilters } from "@asksync/shared";
import { api } from "@convex/api";
import { convertConvexQuestions } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useQuestionsPageStore } from "@/questions/stores/questionsPageStore";
import { useTags } from "@/tags/hooks/queries";

export function useQuestionsPage() {
  const { activeTab, filters, cursor, setActiveTab, updateFilter, setCursor } =
    useQuestionsPageStore();
  const { tags } = useTags({});

  // Get questions with pagination
  const rawQuestionsResult = useQuery(
    api.questions.queries.listQuestionsByUser,
    {
      filter: activeTab,
      search: filters.search || undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      tagIds: filters.tagIds,
      sortBy: filters.sortBy,
      cursor,
    },
  );

  // Get stats for all tabs
  const stats = useQuery(api.questions.queries.getQuestionStats, {
    search: filters.search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    tagIds: filters.tagIds,
  });

  const questions = convertConvexQuestions(rawQuestionsResult?.questions || []);
  const isLoading = rawQuestionsResult === undefined;
  const hasMore = rawQuestionsResult?.hasMore || false;
  const nextCursor = rawQuestionsResult?.nextCursor;

  const handleFilterChange = (
    key: keyof QuestionFilters,
    value: string | string[],
  ) => {
    updateFilter(key, value);
  };

  const handleLoadMore = () => {
    if (hasMore && nextCursor) {
      setCursor(nextCursor);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const newTagIds = filters.tagIds?.filter((id) => id !== tagId) || [];
    updateFilter("tagIds", newTagIds);
  };

  const handleClearAllTags = () => {
    updateFilter("tagIds", []);
  };

  return {
    activeTab,
    setActiveTab,
    filters,
    handleFilterChange,
    questions,
    isLoading,
    hasMore,
    handleLoadMore,
    stats,
    tags,
    handleRemoveTag,
    handleClearAllTags,
  };
}
