import { QuestionFilters } from "@asksync/shared";
import { QuestionsSearch } from "./QuestionsSearch";
import { QuestionsSortDropdown } from "./QuestionsSortDropdown";
import { QuestionsStatusFilter } from "./QuestionsStatusFilter";
import { QuestionsTagFilter } from "./QuestionsTagFilter";
import { Tag } from "@asksync/shared";

interface QuestionsFiltersBarProps {
  filters: QuestionFilters;
  tags: Tag[] | undefined;
  onFilterChange: (
    key: keyof QuestionFilters,
    value: string | string[],
  ) => void;
}

export function QuestionsFiltersBar({
  filters,
  tags,
  onFilterChange,
}: QuestionsFiltersBarProps): React.ReactNode {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <QuestionsSearch
        value={filters.search || ""}
        onChange={(value) => onFilterChange("search", value)}
      />
      <QuestionsStatusFilter
        value={filters.status}
        onChange={(value) => onFilterChange("status", value as string)}
      />
      <QuestionsSortDropdown
        value={filters.sortBy}
        onChange={(value) => onFilterChange("sortBy", value as string)}
      />
      <QuestionsTagFilter
        selectedTagIds={filters.tagIds || []}
        tags={tags}
        onChange={(value) => onFilterChange("tagIds", value)}
      />
    </div>
  );
}
