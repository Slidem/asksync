/* eslint-disable import/order */
import { getUserWithGroups } from "../auth/user";
import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all permission grants for a specific resource
export const getResourcePermissions = query({
  args: {
    resourceType: v.union(
      v.literal("tags"),
      v.literal("timeblocks"),
      v.literal("questions"),
    ),
    resourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUserWithGroups(ctx);

    // Get all permissions for this specific resource
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_resource", (q) =>
        q
          .eq("resourceType", args.resourceType)
          .eq("resourceId", args.resourceId),
      )
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();

    return {
      specific: permissions,
      all: [...permissions],
    };
  },
});

// Get current user's permission summary
export const getMyPermissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserWithGroups(ctx);

    // Get direct user permissions
    const userPermissions = await ctx.db
      .query("permissions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .collect();

    const groupPermissions = [];
    for (const groupId of user.groupIds) {
      const perms = await ctx.db
        .query("permissions")
        .withIndex("by_group", (q) => q.eq("groupId", groupId))
        .filter((q) => q.eq(q.field("orgId"), user.orgId))
        .collect();
      groupPermissions.push(...perms);
    }

    // Organize by resource type
    const tagPerms = [
      ...userPermissions.filter((p) => p.resourceType === "tags"),
      ...groupPermissions.filter((p) => p.resourceType === "tags"),
    ];
    const timeblockPerms = [
      ...userPermissions.filter((p) => p.resourceType === "timeblocks"),
      ...groupPermissions.filter((p) => p.resourceType === "timeblocks"),
    ];
    const questionPerms = [
      ...userPermissions.filter((p) => p.resourceType === "questions"),
      ...groupPermissions.filter((p) => p.resourceType === "questions"),
    ];

    return {
      userId: user.id,
      role: user.role,
      isAdmin: user.role === "admin",
      groupIds: user.groupIds,
      permissions: {
        tags: tagPerms,
        timeblocks: timeblockPerms,
        questions: questionPerms,
      },
    };
  },
});

// Get current user's permissions on a specific resource
export const getMyResourcePermissions = query({
  args: {
    resourceType: v.union(
      v.literal("tags"),
      v.literal("timeblocks"),
      v.literal("questions"),
    ),
    resourceId: v.union(v.id("tags"), v.id("timeblocks"), v.id("questions")),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    // Admin has full access
    if (user.role === "admin") {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        isAdmin: true,
        isOwner: false,
      };
    }

    // Check if user is the creator/owner
    let resource:
      | {
          orgId?: string;
          createdBy?: string;
          userId?: string;
        }
      | null
      | undefined = null;
    try {
      resource = await ctx.db.get(args.resourceId);
    } catch {
      // Resource doesn't exist or wrong type
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        isOwner: false,
      };
    }

    if (!resource || resource.orgId !== user.orgId) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        isOwner: false,
      };
    }

    const isOwner =
      resource.createdBy === user.id || resource.userId === user.id;

    // Owner has full access
    if (isOwner) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        isAdmin: false,
        isOwner: true,
      };
    }

    // Check individual user permissions
    const userPermissions = await ctx.db
      .query("permissions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("resourceType"), args.resourceType),
          q.or(q.eq(q.field("resourceId"), args.resourceId)),
        ),
      )
      .collect();

    const groupPermissions = [];

    for (const groupId of user.groupIds) {
      const perms = await ctx.db
        .query("permissions")
        .withIndex("by_group", (q) => q.eq("groupId", groupId))
        .filter((q) =>
          q.and(
            q.eq(q.field("orgId"), user.orgId),
            q.eq(q.field("resourceType"), args.resourceType),
            q.or(q.eq(q.field("resourceId"), args.resourceId)),
          ),
        )
        .collect();
      groupPermissions.push(...perms);
    }

    // Combine all permissions and get highest level
    const allPerms = [...userPermissions, ...groupPermissions];

    if (allPerms.length === 0) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isAdmin: false,
        isOwner: false,
      };
    }

    // Get highest permission level
    const hasManage = allPerms.some((p) => p.permission === "manage");
    const hasEdit = allPerms.some((p) => p.permission === "edit");
    const hasView = allPerms.some((p) => p.permission === "view");

    return {
      canView: hasManage || hasEdit || hasView,
      canEdit: hasManage || hasEdit,
      canDelete: hasManage,
      isAdmin: false,
      isOwner: false,
    };
  },
});
