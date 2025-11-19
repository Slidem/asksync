import { GroupWithMemberCount, Membership } from "@/members/types";

import { api } from "@convex/api";
import { useMemo } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";

export const useMemberships = (): Membership[] => {
  const { memberships } = useOrganization({ memberships: { infinite: true } });

  return useMemo(() => {
    if (!memberships?.data) return [];
    return memberships.data.map((m) => {
      const publicData = m.publicUserData || {
        userId: "",
        firstName: "",
        lastName: "",
        identifier: "",
        imageUrl: "",
      };

      const fullName =
        publicData.firstName && publicData.lastName
          ? `${publicData.firstName} ${publicData.lastName}`
          : publicData.identifier || "Unknown User";

      return {
        id: publicData.userId || "",
        name: fullName,
        email: publicData.identifier,
        imageUrl: publicData.imageUrl,
      };
    });
  }, [memberships?.data]);
};

export const useGroups = (): GroupWithMemberCount[] => {
  const groups = useQuery(api.groups.queries.listGroupsWithMemberCounts);
  return useMemo(
    () =>
      (groups || []).map((g) => ({
        id: g._id,
        name: g.name,
        description: g.description,
        color: g.color,
        orgId: g.orgId,
        memberCount: g.memberCount,
      })),
    [groups],
  );
};
