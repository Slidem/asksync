import { PermissionGrant } from "@asksync/shared";
import { ResourceType } from "./types";
import { api } from "@convex/api";
import { toPermissionId } from "@/lib/convexTypes";
import { useCallback } from "react";
import { useMutation } from "convex/react";

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

      for (const newGrant of newGrants) {
        const oldGrant = oldMap.get(newGrant.id);
        if (!oldGrant || !newGrant.id) {
          await grantPermission({
            resourceType,
            resourceId,
            all: newGrant.type === "all",
            groupId: newGrant.groupId,
            userId: newGrant.userId,
            permission: newGrant.permission,
          });
        } else if (oldGrant.permission !== newGrant.permission) {
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
