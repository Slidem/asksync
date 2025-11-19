import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../auth/user";

// Helper to map old permission format to new format
// Old: ["view", "create", "edit", "delete"] -> New: "view" | "edit" | "manage"
const mapOldPermissionToNew = (
  oldPermission: "view" | "create" | "edit" | "delete",
): "view" | "edit" | "manage" => {
  if (oldPermission === "delete" || oldPermission === "create") {
    return "manage"; // create/delete map to manage
  }
  return oldPermission; // view/edit stay the same
};

// Create a new group (admin only)
export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Check if group name already exists in org
    const existing = await ctx.db
      .query("userGroups")
      .withIndex("by_org_and_name", (q) =>
        q.eq("orgId", user.orgId).eq("name", args.name),
      )
      .first();

    if (existing) {
      throw new Error("Group with this name already exists");
    }

    // Create group
    const groupId = await ctx.db.insert("userGroups", {
      name: args.name,
      description: args.description,
      color: args.color,
      orgId: user.orgId,
      createdBy: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return groupId;
  },
});

// Update group (admin only)
export const updateGroup = mutation({
  args: {
    groupId: v.id("userGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Get existing group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Verify group belongs to user's org
    if (group.orgId !== user.orgId) {
      throw new Error("Group not found");
    }

    // If changing name, check for conflicts
    if (args.name && args.name !== group.name) {
      const newName = args.name; // Extract to variable for type narrowing
      const existing = await ctx.db
        .query("userGroups")
        .withIndex("by_org_and_name", (q) =>
          q.eq("orgId", user.orgId).eq("name", newName),
        )
        .first();

      if (existing && existing._id !== args.groupId) {
        throw new Error("Group with this name already exists");
      }
    }

    // Update group
    await ctx.db.patch(args.groupId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.color && { color: args.color }),
      updatedAt: Date.now(),
    });

    return args.groupId;
  },
});

// Delete group (admin only)
export const deleteGroup = mutation({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Verify group belongs to user's org
    if (group.orgId !== user.orgId) {
      throw new Error("Group not found");
    }

    // Delete all group memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete all group permissions
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const permission of permissions) {
      await ctx.db.delete(permission._id);
    }

    // Delete group
    await ctx.db.delete(args.groupId);

    return { deleted: true };
  },
});

// Add member to group (admin only)
export const addMemberToGroup = mutation({
  args: {
    groupId: v.id("userGroups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Verify group belongs to user's org
    if (group.orgId !== user.orgId) {
      throw new Error("Group not found");
    }

    // Check if user is already in group
    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      throw new Error("User is already in this group");
    }

    // Add member to group
    const membershipId = await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      orgId: user.orgId,
      addedBy: user.id,
      addedAt: Date.now(),
    });

    return membershipId;
  },
});

// Remove member from group (admin only)
export const removeMemberFromGroup = mutation({
  args: {
    groupId: v.id("userGroups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Verify group belongs to user's org
    if (group.orgId !== user.orgId) {
      throw new Error("Group not found");
    }

    // Find membership
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!membership) {
      throw new Error("User is not in this group");
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    return { removed: true };
  },
});

// Update permission (admin only)
export const updatePermission = mutation({
  args: {
    permissionId: v.id("permissions"),
    permissions: v.array(
      v.union(
        v.literal("view"),
        v.literal("create"),
        v.literal("edit"),
        v.literal("delete"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Get permission
    const existingPermission = await ctx.db.get(args.permissionId);
    if (!existingPermission) {
      throw new Error("Permission not found");
    }

    // Verify permission belongs to user's org
    if (existingPermission.orgId !== user.orgId) {
      throw new Error("Permission not found");
    }

    // Note: old implementation supported arrays, now we only support single permission
    // Take the first permission from the array for backward compatibility
    const oldPermission = args.permissions[0] || "view";
    const permission = mapOldPermissionToNew(oldPermission);

    // Update permission
    await ctx.db.patch(args.permissionId, {
      permission,
      updatedAt: Date.now(),
    });

    return args.permissionId;
  },
});
