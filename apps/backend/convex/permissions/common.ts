import { Doc } from "../_generated/dataModel";
import { QueryCtx as BaseQueryCtx } from "../_generated/server";
/* eslint-disable import/order */
import { PermissionGrant } from "@asksync/shared";
import { getUserWithGroups } from "../auth/user";
import { Permission, PermissionLevels, UserWithGroups } from "../common/types";

export type ResourceType = "tags" | "timeblocks" | "questions";

export type DecoratedResource<T> = T & {
  permissions: PermissionGrant[];
  canEdit?: boolean;
  canManage?: boolean;
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
  return PermissionLevels[granted] >= PermissionLevels[required];
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

interface DecorateResourceWithGrantsOptions<
  T extends { _id: string; createdBy: string },
> {
  ctx: BaseQueryCtx;
  currentUser: UserWithGroups;
  resourceType: ResourceType;
  resources: T[];
}

export const getPermissionLevelFromGrants = (
  user: UserWithGroups,
  grants: PermissionGrant[],
): Permission | null => {
  let highestPermission: Permission | null = null;

  for (const grant of grants) {
    if (
      grant.type === "all" ||
      (grant.userId && grant.userId === user.id) ||
      (grant.groupId && user.groupIds.includes(grant.groupId))
    ) {
      const permissionToCheck = grant.permission;

      if (
        highestPermission === null ||
        PermissionLevels[permissionToCheck] >
          PermissionLevels[highestPermission]
      ) {
        highestPermission = permissionToCheck;
      }
    }
  }
  return highestPermission;
};

/**
 * Decorate resources with their permission grants
 */
export const decorateResourceWithGrants = async <
  T extends { _id: string; createdBy: string },
>({
  ctx,
  currentUser,
  resourceType,
  resources,
}: DecorateResourceWithGrantsOptions<T>): Promise<DecoratedResource<T>[]> => {
  const permissions = await ctx.db
    .query("permissions")
    .withIndex("by_org_and_type", (q) =>
      q.eq("orgId", currentUser.orgId).eq("resourceType", resourceType),
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

    const currentUserPermissionLevel = getPermissionLevelFromGrants(
      currentUser,
      grants,
    );

    const canEdit =
      currentUser.id === res.createdBy ||
      (currentUserPermissionLevel !== null &&
        meetsPermissionLevel({
          granted: currentUserPermissionLevel,
          required: "edit",
        }));

    const canManage =
      currentUser.id === res.createdBy ||
      (currentUserPermissionLevel !== null &&
        meetsPermissionLevel({
          granted: currentUserPermissionLevel,
          required: "manage",
        }));

    return { ...res, permissions: grants, canEdit, canManage };
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
