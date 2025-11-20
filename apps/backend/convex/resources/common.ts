import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { ResourceIdType } from "./model";

export const getResourceById = async <
  T extends { _id: string; createdBy: string },
>(
  ctx: BaseQueryCtx,
  resourceId: ResourceIdType,
): Promise<T | null> => {
  const resource = await ctx.db.get(resourceId as ResourceIdType);
  return resource as T | null;
};
