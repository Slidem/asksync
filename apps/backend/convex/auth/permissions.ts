import { Id } from "../_generated/dataModel";
import { QueryCtx as BaseQueryCtx } from "../_generated/server";
import { getUserWithPermissions } from "./user";

export type ResourceType = "tags" | "timeblocks";
export type Permission = "view" | "create" | "edit" | "delete";

/**
 * Check if user has a specific permission for a resource
 * Admins have all permissions by default
 */
export const hasPermission = async (
  ctx: BaseQueryCtx,
  resourceType: ResourceType,
  resourceId: string,
  permission: Permission,
): Promise<boolean> => {
  const user = await getUserWithPermissions(ctx);

  // Admins have all permissions
  if (user.role === "admin") {
    return true;
  }

  // Check if user owns the resource (creator has full permissions on their own resources)
  const resource = await ctx.db.get(resourceId as Id<"tags" | "timeblocks">);
  if (resource) {
    if ("createdBy" in resource && resource.createdBy === user.id) {
      return true;
    }
    if ("userId" in resource && resource.userId === user.id) {
      return true;
    }
  }

  // Check group permissions for this specific resource
  const specificPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId === resourceId,
  );

  for (const perm of specificPermissions) {
    if (perm.permissions.includes(permission)) {
      return true;
    }
  }

  // Check group permissions for all resources of this type (wildcard)
  const wildcardPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId === "*",
  );

  for (const perm of wildcardPermissions) {
    if (perm.permissions.includes(permission)) {
      return true;
    }
  }

  return false;
};

/**
 * Get all resources of a type that the user has a specific permission for
 * Returns array of resource IDs
 */
export const getPermittedResources = async (
  ctx: BaseQueryCtx,
  resourceType: ResourceType,
  permission: Permission,
): Promise<string[]> => {
  const user = await getUserWithPermissions(ctx);

  // Admins can access all resources
  if (user.role === "admin") {
    return ["*"]; // Special marker meaning all resources
  }

  const resourceIds = new Set<string>();

  // Check for wildcard permissions
  const wildcardPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId === "*",
  );

  for (const perm of wildcardPermissions) {
    if (perm.permissions.includes(permission)) {
      return ["*"]; // User has wildcard access
    }
  }

  // Collect specific resource permissions
  const specificPermissions = user.permissions.filter(
    (p) => p.resourceType === resourceType && p.resourceId !== "*",
  );

  for (const perm of specificPermissions) {
    if (perm.permissions.includes(permission)) {
      resourceIds.add(perm.resourceId);
    }
  }

  return Array.from(resourceIds);
};

/**
 * Require admin role, throw error if not admin
 */
export const requireAdminPermission = async (
  ctx: BaseQueryCtx,
): Promise<void> => {
  const user = await getUserWithPermissions(ctx);
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
};

/**
 * Require specific permission for a resource, throw error if not permitted
 */
export const requirePermission = async (
  ctx: BaseQueryCtx,
  resourceType: ResourceType,
  resourceId: string,
  permission: Permission,
): Promise<void> => {
  const permitted = await hasPermission(
    ctx,
    resourceType,
    resourceId,
    permission,
  );
  if (!permitted) {
    throw new Error(
      `Permission denied: ${permission} access to ${resourceType}/${resourceId}`,
    );
  }
};

/**
 * Filter resources based on user permissions
 * Returns only resources the user can view
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterByPermissions = async <T extends { _id: Id<any> }>(
  ctx: BaseQueryCtx,
  resourceType: ResourceType,
  resources: T[],
  permission: Permission = "view",
): Promise<T[]> => {
  const user = await getUserWithPermissions(ctx);

  // Admins see everything
  if (user.role === "admin") {
    return resources;
  }

  const permittedIds = await getPermittedResources(
    ctx,
    resourceType,
    permission,
  );

  // If user has wildcard access, return all
  if (permittedIds.includes("*")) {
    return resources;
  }

  // Filter to only permitted resources
  return resources.filter((resource) => {
    const resourceId = resource._id;

    // Check if this specific resource is permitted
    if (permittedIds.includes(resourceId)) {
      return true;
    }

    // Check if user owns this resource
    if ("createdBy" in resource && resource.createdBy === user.id) {
      return true;
    }
    if ("userId" in resource && resource.userId === user.id) {
      return true;
    }

    return false;
  });
};

/**
 * Check if user can manage groups (admin only)
 */
export const canManageGroups = async (ctx: BaseQueryCtx): Promise<boolean> => {
  const user = await getUserWithPermissions(ctx);
  return user.role === "admin";
};

/**
 * Get all permissions for current user (useful for frontend)
 */
export const getUserPermissionsSummary = async (ctx: BaseQueryCtx) => {
  const user = await getUserWithPermissions(ctx);

  return {
    userId: user.id,
    role: user.role,
    isAdmin: user.role === "admin",
    groupIds: user.groupIds,
    permissions: user.permissions.map((p) => ({
      resourceType: p.resourceType,
      resourceId: p.resourceId,
      permissions: p.permissions,
    })),
  };
};
