import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { hasPermission } from "../auth/permissions";
import { getUserWithPermissions } from "../auth/user";

// Helper: Get accessible resource IDs for internal use
export async function getAccessibleResourceIds(
  resourceType: "tags" | "timeblocks",
  permission: "view" | "create" | "edit" | "delete",
  user: Awaited<ReturnType<typeof getUserWithPermissions>>,
): Promise<string[]> {
  // Admins can access all
  if (user.role === "admin") {
    return []; // Empty array means "all" when combined with admin check
  }

  // Check for wildcard permissions
  const wildcardPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId === "*",
  );

  for (const perm of wildcardPermissions) {
    if (perm.permissions.includes(permission)) {
      return []; // Empty array means "all" when combined with wildcard check
    }
  }

  // Collect specific resource IDs
  const resourceIds = new Set<string>();

  const specificPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId !== "*",
  );

  for (const perm of specificPermissions) {
    if (perm.permissions.includes(permission)) {
      resourceIds.add(perm.resourceId);
    }
  }

  return Array.from(resourceIds);
}

// Get current user's permission summary
export const getMyPermissions = query({
  handler: async (
    ctx,
  ): Promise<{
    userId: string;
    role: "admin" | "member";
    isAdmin: boolean;
    groupIds: string[];
    tagPermissions: Array<{
      resourceId: string;
      canView: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
    timeblockPermissions: Array<{
      resourceId: string;
      canView: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }> => {
    const user = await getUserWithPermissions(ctx);

    // Organize permissions by resource type
    const tagPerms = user.permissions.filter((p) => p.resourceType === "tags");
    const timeblockPerms = user.permissions.filter(
      (p) => p.resourceType === "timeblocks",
    );

    return {
      userId: user.id,
      role: user.role,
      isAdmin: user.role === "admin",
      groupIds: user.groupIds,
      tagPermissions: tagPerms.map((p) => ({
        resourceId: p.resourceId,
        canView: p.permissions.includes("view"),
        canEdit: p.permissions.includes("edit"),
        canDelete: p.permissions.includes("delete"),
      })),
      timeblockPermissions: timeblockPerms.map((p) => ({
        resourceId: p.resourceId,
        canView: p.permissions.includes("view"),
        canEdit: p.permissions.includes("edit"),
        canDelete: p.permissions.includes("delete"),
      })),
    };
  },
});

// Check if current user has a specific permission for a resource
export const checkPermission = query({
  args: {
    resourceType: v.union(v.literal("tags"), v.literal("timeblocks")),
    resourceId: v.union(v.id("tags"), v.id("timeblocks")),
    permission: v.union(
      v.literal("view"),
      v.literal("create"),
      v.literal("edit"),
      v.literal("delete"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithPermissions(ctx);

    // Admins have all permissions
    if (user.role === "admin") {
      return true;
    }

    // Check if user owns the resource
    let resource = null;

    if (args.resourceType === "tags") {
      resource = await ctx.db.get(args.resourceId as Id<"tags">);
    } else if (args.resourceType === "timeblocks") {
      resource = await ctx.db.get(args.resourceId as Id<"timeblocks">);
    }

    if (resource) {
      if ("createdBy" in resource && resource.createdBy === user.id) {
        return true;
      }
      if ("userId" in resource && resource.userId === user.id) {
        return true;
      }
    }

    // Check specific resource permissions
    const specificPermissions = user.permissions.filter(
      (p) =>
        p.resourceType === args.resourceType &&
        p.resourceId === args.resourceId,
    );

    for (const perm of specificPermissions) {
      if (perm.permissions.includes(args.permission)) {
        return true;
      }
    }

    // Check wildcard permissions
    const wildcardPermissions = user.permissions.filter(
      (p) => p.resourceType === args.resourceType && p.resourceId === "*",
    );

    for (const perm of wildcardPermissions) {
      if (perm.permissions.includes(args.permission)) {
        return true;
      }
    }

    return false;
  },
});

// Get all resources of a type that user can access
export const getAccessibleResources = query({
  args: {
    resourceType: v.union(v.literal("tags"), v.literal("timeblocks")),
    permission: v.optional(
      v.union(
        v.literal("view"),
        v.literal("create"),
        v.literal("edit"),
        v.literal("delete"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithPermissions(ctx);
    const permission = args.permission ?? "view";

    // Admins can access all
    if (user.role === "admin") {
      return { hasWildcardAccess: true, resourceIds: [] };
    }

    // Check for wildcard permissions
    const wildcardPermissions = user.permissions.filter(
      (p) => p.resourceType === args.resourceType && p.resourceId === "*",
    );

    for (const perm of wildcardPermissions) {
      if (perm.permissions.includes(permission)) {
        return { hasWildcardAccess: true, resourceIds: [] };
      }
    }

    // Collect specific resource IDs
    const resourceIds = new Set<string>();

    const specificPermissions = user.permissions.filter(
      (p) => p.resourceType === args.resourceType && p.resourceId !== "*",
    );

    for (const perm of specificPermissions) {
      if (perm.permissions.includes(permission)) {
        resourceIds.add(perm.resourceId);
      }
    }

    return {
      hasWildcardAccess: false,
      resourceIds: Array.from(resourceIds),
    };
  },
});

// Get permissions for a specific resource
export const getResourcePermissions = query({
  args: {
    resourceType: v.union(v.literal("tags"), v.literal("timeblocks")),
    resourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUserWithPermissions(ctx);

    // Get all permissions for this resource
    const permissions = await ctx.db
      .query("groupPermissions")
      .withIndex("by_resource", (q) =>
        q
          .eq("resourceType", args.resourceType)
          .eq("resourceId", args.resourceId),
      )
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();

    // Also get wildcard permissions
    const wildcardPermissions = await ctx.db
      .query("groupPermissions")
      .withIndex("by_resource", (q) =>
        q.eq("resourceType", args.resourceType).eq("resourceId", "*"),
      )
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();

    return {
      specific: permissions,
      wildcard: wildcardPermissions,
    };
  },
});

// Get all permissions in the organization (admin only)
export const listAllPermissions = query({
  handler: async (ctx) => {
    const user = await getUserWithPermissions(ctx);

    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const permissions = await ctx.db
      .query("groupPermissions")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    return permissions.map((p) => ({
      id: p._id,
      groupId: p.groupId,
      orgId: p.orgId,
      resourceType: p.resourceType,
      resourceId: p.resourceId,
      permissions: p.permissions,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },
});

// Check if user can manage groups (is admin)
export const canManageGroups = query({
  handler: async (ctx): Promise<boolean> => {
    const user = await getUserWithPermissions(ctx);
    return user.role === "admin";
  },
});

// Get permission breakdown for current user (useful for debugging)
// Get current user's permissions for a specific resource
export const getMyResourcePermissions = query({
  args: {
    resourceType: v.union(v.literal("tags"), v.literal("timeblocks")),
    resourceId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithPermissions(ctx);

    // Check if user is owner
    const resource = await ctx.db.get(
      args.resourceId as Id<"tags" | "timeblocks">,
    );
    const isOwner =
      resource &&
      (("createdBy" in resource && resource.createdBy === user.id) ||
        ("userId" in resource && resource.userId === user.id));

    // Admin and owners have all permissions
    if (user.role === "admin" || isOwner) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        isOwner: !!isOwner,
        isAdmin: user.role === "admin",
      };
    }

    // Check group permissions
    const canView = await hasPermission(
      ctx,
      args.resourceType,
      args.resourceId,
      "view",
    );
    const canEdit = await hasPermission(
      ctx,
      args.resourceType,
      args.resourceId,
      "edit",
    );
    const canDelete = await hasPermission(
      ctx,
      args.resourceType,
      args.resourceId,
      "delete",
    );

    return {
      canView,
      canEdit,
      canDelete,
      isOwner: false,
      isAdmin: false,
    };
  },
});

export const getMyPermissionBreakdown = query({
  handler: async (ctx) => {
    const user = await getUserWithPermissions(ctx);

    // Organize permissions by resource type
    const tagPermissions = user.permissions.filter(
      (p) => p.resourceType === "tags",
    );
    const timeblockPermissions = user.permissions.filter(
      (p) => p.resourceType === "timeblocks",
    );

    return {
      role: user.role as "admin" | "member",
      isAdmin: user.role === "admin",
      groupCount: user.groupIds.length,
      permissionSummary: {
        tags: {
          wildcardCount: tagPermissions.filter((p) => p.resourceId === "*")
            .length,
          specificCount: tagPermissions.filter((p) => p.resourceId !== "*")
            .length,
        },
        timeblocks: {
          wildcardCount: timeblockPermissions.filter(
            (p) => p.resourceId === "*",
          ).length,
          specificCount: timeblockPermissions.filter(
            (p) => p.resourceId !== "*",
          ).length,
        },
      },
      totalPermissions: user.permissions.length,
    };
  },
});
