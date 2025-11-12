import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getUser } from "../auth/user";

// List all groups in organization
export const listGroups = query({
  handler: async (ctx) => {
    const { orgId } = await getUser(ctx);

    const groups = await ctx.db
      .query("userGroups")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    return groups as Array<{
      _id: Id<"userGroups">;
      name: string;
      description?: string;
      color: string;
      orgId: string;
      createdBy: string;
      createdAt: number;
      updatedAt: number;
    }>;
  },
});

// Get a single group by ID
export const getGroup = query({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUser(ctx);

    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return null;
    }

    return group;
  },
});

// Get group with its members
export const getGroupWithMembers = query({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUser(ctx);

    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return null;
    }

    // Get all members in this group
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return {
      ...group,
      members: memberships,
      memberCount: memberships.length,
    };
  },
});

// Get all groups with member counts
export const listGroupsWithMemberCounts = query({
  handler: async (ctx) => {
    const { orgId } = await getUser(ctx);

    const groups = await ctx.db
      .query("userGroups")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    // Get member counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const memberships = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        return {
          _id: group._id,
          name: group.name,
          description: group.description,
          color: group.color,
          orgId: group.orgId,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          memberCount: memberships.length,
        };
      }),
    );

    return groupsWithCounts;
  },
});

// Get groups for a specific user
export const getUserGroups = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUser(ctx);

    // Get user's group memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", orgId),
      )
      .collect();

    // Get group details
    const groups = await Promise.all(
      memberships.map((m) => ctx.db.get(m.groupId as Id<"userGroups">)),
    );

    return groups.filter(Boolean);
  },
});

// Get current user's groups
export const getMyGroups = query({
  handler: async (ctx) => {
    const { orgId, id: userId } = await getUser(ctx);

    // Get user's group memberships
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    // Get group details
    const groups = await Promise.all(
      memberships.map((m) => ctx.db.get(m.groupId as Id<"userGroups">)),
    );

    return groups.filter(Boolean) as Array<{
      _id: Id<"userGroups">;
      name: string;
      description?: string;
      color: string;
      orgId: string;
      createdBy: string;
      createdAt: number;
      updatedAt: number;
    }>;
  },
});

// Get group members
export const getGroupMembers = query({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUser(ctx);

    // Verify group exists and belongs to org
    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return [];
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return memberships;
  },
});

// Get group permissions
export const getGroupPermissions = query({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await getUser(ctx);

    // Verify group exists and belongs to org
    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return [];
    }

    const permissions = await ctx.db
      .query("groupPermissions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return permissions;
  },
});

// Get comprehensive group details (members + permissions)
export const getGroupDetails = query({
  args: {
    groupId: v.id("userGroups"),
  },
  handler: async (ctx, args) => {
    const { orgId, role } = await getUser(ctx);

    // Get group
    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return null;
    }

    // Get members
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get permissions
    const permissions = await ctx.db
      .query("groupPermissions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return {
      ...group,
      members: memberships,
      memberCount: memberships.length,
      permissions,
      canEdit: role === "admin",
    };
  },
});

// Check if user is member of a group
export const isUserInGroup = query({
  args: {
    groupId: v.id("userGroups"),
    userId: v.optional(v.string()), // if not provided, checks current user
  },
  handler: async (ctx, args) => {
    const { orgId, id: currentUserId } = await getUser(ctx);
    const userId = args.userId ?? currentUserId;

    // Verify group exists and belongs to org
    const group = await ctx.db.get(args.groupId);
    if (!group || group.orgId !== orgId) {
      return false;
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return !!membership;
  },
});
