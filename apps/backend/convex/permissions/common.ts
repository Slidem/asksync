import { QueryCtx as BaseQueryCtx } from "../_generated/server";
/* eslint-disable import/order */
import { Doc } from "../_generated/dataModel";
import { Permission } from "../common/types";
import { PermissionGrant } from "@asksync/shared";
import { getUserWithGroups } from "../auth/user";

export type ResourceType = "tags" | "timeblocks" | "questions";

export type DecoratedResource<T> = T & {
  permissions: PermissionGrant[];
};

/**
 * Check if a permission level meets the required level
 * manage > edit > view
 */
const meetsPermissionLevel = ({
  granted,
  required,
}: {
  granted: Permission;
  required: Permission;
}): boolean => {
  if (granted === "manage") {
    return true;
  }

  if (granted === "edit" && required !== "manage") {
    return true;
  }

  if (granted === "view" && required === "view") {
    return true;
  }

  return false;
};

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
  const user = await getUserWithGroups(ctx);

  if (user.role === "admin") {
    return true;
  }

  const resourcePermissions = await ctx.db
    .query("permissions")
    .withIndex("by_org_and_type_and_resourceId", (q) =>
      q
        .eq("orgId", user.orgId)
        .eq("resourceType", resourceType)
        .eq("resourceId", resourceId),
    )
    .collect();

  return resourcePermissions.some(
    (perm) =>
      (perm.all ||
        (perm.userId && perm.userId === user.id) ||
        (perm.groupId && user.groupIds.includes(perm.groupId))) &&
      meetsPermissionLevel({ granted: perm.permission, required: permission }),
  );
};

export const decorateResourceWithGrants = async <
  T extends { _id: string; createdBy: string },
>(
  ctx: BaseQueryCtx,
  orgId: string,
  resourceType: ResourceType,
  resources: T[],
): Promise<DecoratedResource<T>[]> => {
  const permissions = await ctx.db
    .query("permissions")
    .withIndex("by_org_and_type", (q) =>
      q.eq("orgId", orgId).eq("resourceType", resourceType),
    )
    .collect();

  const permissionsByResource: Record<string, Doc<"permissions">[]> =
    permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resourceId]) {
          acc[perm.resourceId] = [];
        }
        acc[perm.resourceId].push(perm);
        return acc;
      },
      {} as Record<string, Doc<"permissions">[]>,
    );

  return resources.map((res) => {
    const perms = permissionsByResource[res._id] || [];
    const grants: PermissionGrant[] = perms.map((perm) => ({
      id: perm._id,
      isCreator: perm.userId === res.createdBy,
      type: perm.all ? "all" : perm.groupId ? "group" : "user",
      groupId: perm.groupId,
      userId: perm.userId,
      permission: perm.permission,
    }));
    return { ...res, permissions: grants };
  });
};

/**
 * Get IDs of resources of a given type that the user has at least the specified permission for
 */
export const getPermittedResourcesForType = async (
  ctx: BaseQueryCtx,
  resourceType: ResourceType,
  permission: Permission,
): Promise<string[]> => {
  const user = await getUserWithGroups(ctx);
  const resourceIds = new Set<string>();

  const permissions = await ctx.db
    .query("permissions")
    .withIndex("by_org_and_type", (q) =>
      q.eq("orgId", user.orgId).eq("resourceType", resourceType),
    )
    .collect();

  if (!permissions.length) {
    return [];
  }

  const permissionsByResource: Record<string, Doc<"permissions">[]> =
    permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resourceId]) {
          acc[perm.resourceId] = [];
        }
        acc[perm.resourceId].push(perm);
        return acc;
      },
      {} as Record<string, Doc<"permissions">[]>,
    );

  for (const [resId, perms] of Object.entries(permissionsByResource)) {
    const userAssociatedPerms = perms.filter(
      (perm) =>
        perm.all ||
        (perm.userId && perm.userId === user.id) ||
        (perm.groupId && user.groupIds.includes(perm.groupId)),
    );

    if (
      userAssociatedPerms.some((perm) =>
        meetsPermissionLevel({
          granted: perm.permission,
          required: permission,
        }),
      )
    ) {
      resourceIds.add(resId);
    }
  }

  return Array.from(resourceIds);
};
