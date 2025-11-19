import { useCallback, useMemo } from "react";
import { useGroups, useMemberships } from "@/members/queries/queries";
import { useMutation, useQuery } from "convex/react";

import { PermissionGrant } from "@asksync/shared";
import { ResourceType } from "./types";
import { api } from "@convex/api";
import { toPermissionId } from "@/lib/convexTypes";

export const useResourceExistingGrants = (
  resourceType: ResourceType,
  resourceId: string,
) => {
  const members = useMemberships();
  const groups = useGroups();
  const rawPermissions = useQuery(
    api.permissions.queries.getResourcePermissions,
    resourceId ? { resourceType, resourceId } : "skip",
  );

  const existingPermissions = useMemo(
    () => rawPermissions?.all || [],
    [rawPermissions],
  );

  return useMemo(() => {
    return existingPermissions
      .map((perm) => {
        if (perm.userId) {
          const membership = members.find((m) => m.id === perm.userId) || {
            name: "Unknown User",
            imageUrl: undefined,
          };

          return {
            id: perm._id,
            type: "user" as const,
            userId: perm.userId,
            name: membership.name,
            imageUrl: membership.imageUrl,
            permission: perm.permission,
            isCreator: false,
          };
        } else if (perm.groupId) {
          const group = groups.find((g) => g.id === perm.groupId);
          return {
            id: perm._id,
            type: "group" as const,
            groupId: perm.groupId,
            name: group?.name || "Unknown Group",
            color: group?.color,
            permission: perm.permission,
            isCreator: false,
          };
        }
        return null;
      })
      .filter((grant) => grant !== null);
  }, [existingPermissions, members, groups]);
};

// Sync permissions for a resource (add/update/remove)
export function useSyncPermissions() {
  const grantPermission = useMutation(
    api.permissions.mutations.grantPermission,
  );
  const revokePermission = useMutation(
    api.permissions.mutations.revokePermission,
  );
  const updatePermission = useMutation(
    api.permissions.mutations.updatePermission,
  );

  return useCallback(
    async (
      resourceType: ResourceType,
      resourceId: string,
      oldGrants: PermissionGrant[],
      newGrants: PermissionGrant[],
    ) => {
      // Find grants to add, update, and remove
      const oldMap = new Map(oldGrants.map((g) => [g.id, g]));
      const newMap = new Map(newGrants.map((g) => [g.id, g]));

      // Remove deleted grants
      for (const oldGrant of oldGrants) {
        const { id } = oldGrant;
        if (!newMap.has(id) && id) {
          await revokePermission({
            permissionId: toPermissionId(id),
          });
        }
      }

      // Add new grants or update existing ones
      for (const newGrant of newGrants) {
        const oldGrant = oldMap.get(newGrant.id);

        if (!oldGrant || !newGrant.id) {
          // New grant - create it
          await grantPermission({
            resourceType,
            resourceId,
            groupId: newGrant.groupId,
            userId: newGrant.userId,
            permission: newGrant.permission,
          });
        } else if (oldGrant.permission !== newGrant.permission) {
          // Updated permission level
          await updatePermission({
            permissionId: toPermissionId(newGrant.id),
            permission: newGrant.permission,
          });
        }
      }
    },
    [grantPermission, revokePermission, updatePermission],
  );
}
