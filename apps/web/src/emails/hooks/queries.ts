import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex/react";

export const useGmailConnections = () => {
  const connections = useQuery(api.gmail.queries.listConnections);
  return {
    connections: connections || [],
    isLoading: connections === undefined,
  };
};

export const useConversionRules = (connectionId?: Id<"gmailConnections">) => {
  const rules = useQuery(api.gmail.queries.listRules, {
    connectionId,
  });
  return {
    rules: rules || [],
    isLoading: rules === undefined,
  };
};

export const useAttentionItems = (options?: {
  status?: "pending" | "resolved";
  connectionId?: Id<"gmailConnections">;
}) => {
  const items = useQuery(api.gmail.queries.listAttentionItems, {
    status: options?.status,
    connectionId: options?.connectionId,
  });
  return {
    items: items || [],
    isLoading: items === undefined,
  };
};

export const useAttentionItemCounts = () => {
  const counts = useQuery(api.gmail.queries.getAttentionItemCounts);
  return {
    counts: counts || { pending: 0, resolved: 0, total: 0 },
    isLoading: counts === undefined,
  };
};
