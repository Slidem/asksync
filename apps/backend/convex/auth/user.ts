import { Auth } from "convex/server";
import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { User, UserWithGroups } from "../common/types";

export const getUser = async (ctx: { auth: Auth }): Promise<User> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // org id is added as a custom claim in the JWT in clerk
  const orgId = identity.orgId;

  if (!orgId || typeof orgId !== "string") {
    throw new Error("No active organization");
  }

  // role is added as a custom claim in the JWT by clerk
  // defaults to "basic_member" if not set
  const orgRole = identity.role as string | undefined;
  const role = orgRole === "org:admin" ? "admin" : "member";

  return {
    id: identity.subject,
    email: identity.email,
    name: identity.name,
    orgId: orgId,
    role: role as "admin" | "member",
  };
};

// Extended version that includes group memberships and permissions
// TODO: We should move group memberships to jwt claims for performance later !
export const getUserWithGroups = async (
  ctx: BaseQueryCtx,
): Promise<UserWithGroups> => {
  const user = await getUser(ctx);

  // Get user's group memberships
  const groupMemberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_user_and_org", (q) =>
      q.eq("userId", user.id).eq("orgId", user.orgId),
    )
    .collect();

  const groupIds = groupMemberships.map((gm) => gm.groupId);

  return {
    ...user,
    groupIds,
  };
};

// Helper to check if user is admin
export const requireAdmin = async (ctx: { auth: Auth }) => {
  const user = await getUser(ctx);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
};
