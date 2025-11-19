import { PermissionGrant } from "@asksync/shared";

export type ResourceType = "tags" | "timeblocks" | "questions";

export interface SelectableUser {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
}

export interface SelectableGroup {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}

export const getDefaultCreateResourceGrants = (
  currentUserId: string,
): PermissionGrant[] => {
  const now = Date.now();
  return [
    {
      id: `temp-group-${now}`,
      type: "all",
      permission: "view",
    },
    {
      id: `temp-user-${now}`,
      type: "user",
      userId: currentUserId,
      permission: "manage",
      isCreator: true,
    },
  ];
};
