import { SortOrder, TagSortBy } from "@asksync/shared";

import { api } from "@convex/api";
import { docToTag } from "@/lib/convexTypes";
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
