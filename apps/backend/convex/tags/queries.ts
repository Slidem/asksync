/* eslint-disable import/order */
import {
  decorateResourceWithGrants,
  getPermittedResourcesForType,
} from "../permissions/common";

import { expandRecurringTimeblocks } from "../timeblocks/helpers";
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

/**
 * Get tags that have available timeblocks for a specific user within date range
 */
export const getTagsWithAvailableTimeblocks = query({
  args: {
    userId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);
    const { orgId, id: currentUserId, role } = user;

    // Get all org tags
    const orgTags = await ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    if (orgTags.length === 0) {
      return [];
    }

    // Get tags accessible through permissions
    const accessibleTagIds = await getPermittedResourcesForType(
      ctx,
      "tags",
      "view",
    );

    const visibleTags = orgTags.filter((tag) => {
      if (role === "admin") return true;
      if (tag.createdBy === currentUserId) return true;
      return accessibleTagIds.includes(tag._id);
    });

    // Get user's timeblocks
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (qb) =>
        qb.eq("orgId", orgId).eq("createdBy", args.userId),
      )
      .collect();

    // Expand recurring timeblocks
    const expandedTimeblocks = expandRecurringTimeblocks(
      timeblocks,
      args.startDate,
      args.endDate,
    );

    const filteredTimeblocks = expandedTimeblocks.filter(
      (tb) => tb.startTime >= args.startDate && tb.startTime < args.endDate,
    );

    // Count timeblocks per tag and find fastest answer time
    const tagStats = new Map<
      string,
      { count: number; fastestAnswerMinutes: number }
    >();

    const currentDateMinutes = Math.floor(Date.now() / 60000);

    for (const timeblock of filteredTimeblocks) {
      for (const tagId of timeblock.tagIds) {
        const tag = visibleTags.find((t) => t._id === tagId);
        if (!tag) continue;

        const stats = tagStats.get(tagId) || {
          count: 0,
          fastestAnswerMinutes: Infinity,
        };
        stats.count++;

        // Calculate answer time for this tag
        if (tag.answerMode === "on-demand" && tag.responseTimeMinutes) {
          stats.fastestAnswerMinutes = Math.min(
            stats.fastestAnswerMinutes,
            tag.responseTimeMinutes,
          );
        } else if (tag.answerMode === "scheduled") {
          const responseTime =
            Math.floor(timeblock.startTime / 60000) - currentDateMinutes;

          stats.fastestAnswerMinutes = Math.min(
            stats.fastestAnswerMinutes,
            responseTime,
          );
        }

        tagStats.set(tagId, stats);
      }
    }

    // Include all tags: on-demand tags and tags with timeblocks
    const tagsWithTimeblocks = visibleTags
      .map((tag) => {
        const stats = tagStats.get(tag._id);

        // On-demand tags don't need timeblocks
        if (tag.answerMode === "on-demand") {
          return {
            ...tag,
            availableTimeblockCount: 0,
            fastestAnswerMinutes: tag.responseTimeMinutes || 24 * 60,
          };
        }

        // Scheduled tags without timeblocks are filtered out
        if (!stats) return null;

        return {
          ...tag,
          availableTimeblockCount: stats.count,
          fastestAnswerMinutes:
            stats.fastestAnswerMinutes === Infinity
              ? 24 * 60
              : stats.fastestAnswerMinutes,
        };
      })
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return await decorateResourceWithGrants({
      ctx,
      currentUser: user,
      resourceType: "tags",
      resources: tagsWithTimeblocks,
    });
  },
});
