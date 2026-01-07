import { useQuery } from "convex/react";

import { api } from "@convex/api";
import { Id } from "@convex/dataModel";

export function useTimeblockAttentionItems(timeblockIds?: Id<"timeblocks">[]) {
  const items = useQuery(
    api.gmail.queries.getCurrentFocusAttentionItems,
    timeblockIds && timeblockIds.length > 0 ? { timeblockIds } : {},
  );

  return {
    isLoading: items === undefined,
    items: items || [],
  };
}
