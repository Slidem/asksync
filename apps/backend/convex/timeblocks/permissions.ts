/* eslint-disable import/order */
import { MutationCtx, QueryCtx } from "../_generated/server";

import { Id } from "../_generated/dataModel";

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
}: {
  ctx: QueryCtx | MutationCtx;
  args: { id: Id<"timeblocks"> };
  orgId: string;
  userId: string;
}) {
  const existingTimeblock = await ctx.db.get(args.id);

  if (!existingTimeblock) {
    throw new Error("Timeblock not found");
  }

  if (existingTimeblock.orgId !== orgId) {
    throw new Error("Not authorized to modify this timeblock");
  }
  if (existingTimeblock.userId !== userId) {
    throw new Error("Can only modify your own timeblocks");
  }

  return existingTimeblock;
}
