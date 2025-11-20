/* eslint-disable import/order */
import {
  decorateResourceWithGrants,
  getPermittedResourcesForType,
} from "../permissions/common";

import { getUserWithGroups } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all tags for the current organization
 */
export const listTagsByOrg = query({
  args: {
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
    const user = await getUserWithGroups(ctx);
    const { orgId, id: userId, role } = user;

    const tagsQuery = ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("orgId", orgId));

    const orgTags = await tagsQuery.collect();

    if (orgTags.length === 0) {
      return {
        tags: [],
        totalVisibleTags: 0,
      };
    }

    // Get tags accessible through permissions (groups + direct user permissions)
    const accessibleTagIds = await getPermittedResourcesForType(
      ctx,
      "tags",
      "view",
    );

    // User can see: their own tags, tags shared via permissions, or all if admin
    const visibleTags = orgTags.filter((tag) => {
      if (role === "admin") return true;
      if (tag.createdBy === userId) return true;
      return accessibleTagIds.includes(tag._id);
    });

    let tags = visibleTags;
    // normally we should use proper indexes for sorting, but because the tag list should be relatively small (probably no more than a few hundred tags),
    // we can just sort in memory for simplicity

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
      tags: await decorateResourceWithGrants({
        ctx,
        currentUser: user,
        resourceType: "tags",
        resources: tags,
      }),
      totalVisibleTags: visibleTags.length,
    };
  },
});
