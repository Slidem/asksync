import { getUserWithGroups } from "../auth/user";
import { ResourceIdType } from "../resources/model";
import { hasPermission } from "./common";
/* eslint-disable import/order */
import { mutation } from "../_generated/server";
/* eslint-disable import/order */
import { v } from "convex/values";

// Grant permission to a group or user for a resource
export const grantPermission = mutation({
  args: {
    all: v.optional(v.boolean()),
    resourceType: v.union(
      v.literal("tags"),
      v.literal("timeblocks"),
      v.literal("questions"),
    ),
    resourceId: v.string(),
    groupId: v.optional(v.string()),
    userId: v.optional(v.string()),
    permission: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("manage"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    if (
      (await hasPermission(
        ctx,
        args.resourceType,
        args.resourceId as ResourceIdType,
        "manage",
      )) === false
    ) {
      throw new Error(
        "You don't have permission to manage permissions for this resource",
      );
    }

    // Validate exactly one of: all, groupId, or userId
    const scopeCount = [args.all, args.groupId, args.userId].filter(
      Boolean,
    ).length;
    if (scopeCount === 0) {
      throw new Error("Must provide either all: true, groupId, or userId");
    }
    if (scopeCount > 1) {
      throw new Error("Cannot provide multiple scopes (all, groupId, userId)");
    }

    // Check if permission already exists
    const existingPermission = await ctx.db
      .query("permissions")
      .withIndex("by_org_and_type_and_resourceId", (q) =>
        q
          .eq("orgId", user.orgId)
          .eq("resourceType", args.resourceType)
          .eq("resourceId", args.resourceId),
      )
      .filter((q) =>
        args.all
          ? q.eq(q.field("all"), true)
          : args.groupId
            ? q.eq("groupId", args.groupId)
            : q.eq("userId", args.userId!),
      )
      .first();

    if (existingPermission) {
      // Update existing permission
      await ctx.db.patch(existingPermission._id, {
        permission: args.permission,
        updatedAt: Date.now(),
      });
      return existingPermission._id;
    }

    // Create new permission
    const permissionId = await ctx.db.insert("permissions", {
      all: args.all || false,
      groupId: args.groupId,
      userId: args.userId,
      orgId: user.orgId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      permission: args.permission,
      createdBy: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return permissionId;
  },
});

// Revoke a permission
export const revokePermission = mutation({
  args: {
    permissionId: v.id("permissions"),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    // Get permission
    const permission = await ctx.db.get(args.permissionId);
    if (!permission) {
      throw new Error("Permission not found");
    }

    if (
      !(await hasPermission(
        ctx,
        permission.resourceType,
        permission.resourceId as ResourceIdType,
        "manage",
      ))
    ) {
      throw new Error("You don't have permission to revoke this permission");
    }

    // Verify permission belongs to user's org
    if (permission.orgId !== user.orgId) {
      throw new Error("Permission not found");
    }

    // Delete permission
    await ctx.db.delete(args.permissionId);

    return { deleted: true };
  },
});

// Update a permission level
export const updatePermission = mutation({
  args: {
    permissionId: v.id("permissions"),
    permission: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("manage"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserWithGroups(ctx);

    // Get permission
    const permission = await ctx.db.get(args.permissionId);
    if (!permission) {
      throw new Error("Permission not found");
    }

    if (
      !(await hasPermission(
        ctx,
        permission.resourceType,
        permission.resourceId as ResourceIdType,
        "manage",
      ))
    ) {
      throw new Error("You don't have permission to update this permission");
    }

    // Verify permission belongs to user's org
    if (permission.orgId !== user.orgId) {
      throw new Error("Permission not found");
    }

    // Update permission
    await ctx.db.patch(args.permissionId, {
      permission: args.permission,
      updatedAt: Date.now(),
    });

    return args.permissionId;
  },
});
