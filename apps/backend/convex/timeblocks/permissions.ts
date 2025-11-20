/* eslint-disable import/order */
import { MutationCtx, QueryCtx } from "../_generated/server";

import { Id } from "../_generated/dataModel";
import { hasPermission } from "../permissions/common";

export async function validateTagsPermissions(
  args: { tagIds?: string[] },
  ctx: QueryCtx | MutationCtx,
  orgId: string,
) {
  if (!args.tagIds) {
    return;
  }

  for (const tagId of args.tagIds) {
    const tag = await ctx.db.get(tagId as Id<"tags">);
    if (!tag) {
      throw new Error(`Tag with ID ${tagId} not found`);
    }
    if (tag.orgId !== orgId) {
      throw new Error(`Tag with ID ${tagId} not accessible`);
    }
  }
}
export async function getExistingTimeblock({
  ctx,
  args,
  orgId,
  userId,
  requiredPermission,
}: {
  ctx: QueryCtx | MutationCtx;
  args: { id: Id<"timeblocks"> };
  orgId: string;
  userId: string;
  requiredPermission?: "edit" | "manage";
}) {
  const existingTimeblock = await ctx.db.get(args.id);

  if (!existingTimeblock) {
    throw new Error("Timeblock not found");
  }

  if (existingTimeblock.orgId !== orgId) {
    throw new Error("Not authorized to modify this timeblock");
  }

  // Check permissions: must be owner OR have required permission
  if (requiredPermission) {
    const canPerform = await hasPermission(
      ctx,
      "timeblocks",
      args.id,
      requiredPermission,
    );
    if (existingTimeblock.createdBy !== userId && !canPerform) {
      throw new Error(
        `You don't have permission to ${requiredPermission} this timeblock`,
      );
    }
  } else {
    // Backward compatibility: if no permission specified, require ownership
    if (existingTimeblock.createdBy !== userId) {
      throw new Error("Can only modify your own timeblocks");
    }
  }

  return existingTimeblock;
}
