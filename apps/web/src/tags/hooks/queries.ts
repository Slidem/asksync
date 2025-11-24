import { SortOrder, TagSortBy } from "@asksync/shared";

import { api } from "@convex/api";
import { docToTag } from "@/lib/convexTypes";
import { useMemo } from "react";
import { useOneWeekDateRange } from "@/lib/time";
import { useQuery } from "convex/react";

const DEFAULT_SORTING = {
  sortBy: TagSortBy.NAME,
  sortOrder: SortOrder.ASC,
};

interface UseTagsOptions {
  filter?: {
    searchTerm?: string;
  };
  sorting?: {
    sortBy: TagSortBy;
    sortOrder: SortOrder;
  };
}

export const useTags = ({
  filter = {},
  sorting = DEFAULT_SORTING,
}: UseTagsOptions) => {
  const result = useQuery(api.tags.queries.listTagsByOrg, {
    sortOrder: sorting.sortOrder,
    sortBy: sorting.sortBy,
  }) || {
    tags: [],
    totalVisibleTags: 0,
  };

  let filteredTagsBySearchTerm = result.tags.map(docToTag);

  if (filter.searchTerm) {
    const searchTerm = filter.searchTerm.toLowerCase();
    filteredTagsBySearchTerm = filteredTagsBySearchTerm.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm),
    );
  }

  return {
    tags: filteredTagsBySearchTerm,
    totalVisibleTags: result.totalVisibleTags,
  };
};

export const useTagsWithAvailableTimeblocksForUser = (userId: string) => {
  const { startDate, endDate } = useOneWeekDateRange();
  const rawTags = useQuery(api.tags.queries.getTagsWithAvailableTimeblocks, {
    userId,
    startDate,
    endDate,
  });

  return useMemo(() => {
    const tags = rawTags ? rawTags.map(docToTag) : [];
    return tags.map((tag) => {
      const minutes = tag.fastestAnswerMinutes || 0;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      let answerTimeDisplay = "";
      if (hours > 24) {
        answerTimeDisplay = " > 24h";
      } else if (hours > 0 && mins > 0) {
        answerTimeDisplay = `${hours}h ${mins}m`;
      } else if (hours > 0) {
        answerTimeDisplay = `${hours}h`;
      } else {
        answerTimeDisplay = `${mins}m`;
      }

      return {
        ...tag,
        answerTimeDisplay,
      };
    });
  }, [rawTags]);
};
