import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUser } from "../auth/user";

/**
 * Get all tags for the current organization
 */
export const listTagsByOrg = query({
  args: {
    category: v.optional(
      v.union(v.literal("all"), v.literal("personal"), v.literal("public")),
    ),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("createdAt"),
        v.literal("updatedAt"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    const tagsQuery = ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("orgId", orgId));

    const orgTags = await tagsQuery.collect();

    if (orgTags.length === 0) {
      return {
        tags: [],
        totalVisibleTags: 0,
        totalUserTags: 0,
        totalPublicTags: 0,
      };
    }

    // User cannot see personal tags of other users
    // TODO: We'll add shared tags later (with specific user groups)
    const visibleTags = orgTags.filter(
      (tag) => tag.createdBy === userId || tag.isPublic,
    );
    const userTags = visibleTags.filter((tag) => tag.createdBy === userId);
    const publicTags = visibleTags.filter((tag) => tag.isPublic);

    let tags = visibleTags;
    // normally we should use proper indexes for sorting, but because the tag list should be relatively small (probably no more than a few hundred tags),
    // we can just sort in memory for simplicity
    if (args.category === "personal") {
      tags = userTags;
    }

    if (args.category === "public") {
      tags = publicTags;
    }

    if (args.sortBy === "createdAt") {
      tags = tags.sort((a, b) =>
        args.sortOrder === "asc"
          ? a._creationTime - b._creationTime
          : b._creationTime - a._creationTime,
      );
    }

    if (args.sortBy === "updatedAt") {
      tags = tags.sort((a, b) =>
        args.sortOrder === "asc"
          ? a.updatedAt - b.updatedAt
          : b.updatedAt - a.updatedAt,
      );
    }

    if (args.sortBy === "name") {
      tags = tags.sort((a, b) =>
        args.sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    }

    return {
      tags,
      totalVisibleTags: visibleTags.length,
      totalUserTags: userTags.length,
      totalPublicTags: publicTags.length,
    };
  },
});
