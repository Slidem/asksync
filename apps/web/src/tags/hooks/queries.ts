import { SearchTagCategory, SortBy, SortOrder } from "@asksync/shared";

import { api } from "@convex/api";
import { docToTag } from "@/lib/convexTypes";
import { useQuery } from "convex/react";

const DEFAULT_FILTER = {
  category: SearchTagCategory.ALL,
};

const DEFAULT_SORTING = {
  sortBy: SortBy.NAME,
  sortOrder: SortOrder.ASC,
};

interface UseTagsOptions {
  filter?: {
    searchTerm?: string;
    category?: SearchTagCategory;
  };
  sorting?: {
    sortBy: SortBy;
    sortOrder: SortOrder;
  };
}

export const useTags = ({
  filter = DEFAULT_FILTER,
  sorting = DEFAULT_SORTING,
}: UseTagsOptions) => {
  const result = useQuery(api.tags.queries.listTagsByOrg, {
    category: filter.category,
    sortOrder: sorting.sortOrder,
    sortBy: sorting.sortBy,
  }) || {
    tags: [],
    totalVisibleTags: 0,
    totalUserTags: 0,
    totalPublicTags: 0,
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
    totalUserTags: result.totalUserTags,
    totalPublicTags: result.totalPublicTags,
  };
};
