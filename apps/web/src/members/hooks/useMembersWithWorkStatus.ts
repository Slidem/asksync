import { useOrganization, useUser } from "@clerk/nextjs";

import { WorkStatus } from "@/members/components/WorkStatusIndicator";
import { api } from "@convex/api";
import { useMemo } from "react";
import { useQuery } from "convex/react";

export type MemberWithWorkStatus = {
  // From Clerk
  id: string;
  clerkMembershipId: string;
  userId: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  identifier: string;
  imageUrl: string;
  isCurrentUser: boolean;

  // From Convex (or defaults)
  status: WorkStatus;
  shareDetails: boolean;
  sessionType?: "work" | "shortBreak" | "longBreak";
  focusMode?: string;
  taskTitle?: string;
  questionTitle?: string;
  timeblockTitle?: string;
  expectedEndAt?: number;
};

const STATUS_PRIORITY: Record<WorkStatus, number> = {
  working: 0,
  break: 1,
  paused: 2,
  offline: 3,
};

export function useMembersWithWorkStatus() {
  const { user } = useUser();
  const { memberships } = useOrganization({
    memberships: { infinite: true },
  });

  const teamStatus = useQuery(api.workSessions.queries.team.getTeamWorkStatus);

  const isLoading = memberships === undefined || teamStatus === undefined;

  const members = useMemo(() => {
    if (!memberships?.data) return [];

    // Create lookup map for work status by userId
    type TeamStatusItem = NonNullable<typeof teamStatus>[number];
    const statusByUserId = new Map<string, TeamStatusItem>();
    if (teamStatus) {
      for (const status of teamStatus) {
        statusByUserId.set(status.userId, status);
      }
    }

    const enrichedMembers: MemberWithWorkStatus[] = memberships.data.map(
      (membership) => {
        const userId = membership.publicUserData?.userId || "";
        const isCurrentUser = userId === user?.id;

        // Skip work status for current user (they see it in sidebar timer)
        const workStatus = isCurrentUser ? null : statusByUserId.get(userId);

        return {
          id: userId,
          clerkMembershipId: membership.id,
          userId,
          role: membership.role,
          firstName: membership.publicUserData?.firstName || null,
          lastName: membership.publicUserData?.lastName || null,
          identifier: membership.publicUserData?.identifier || "",
          imageUrl: membership.publicUserData?.imageUrl || "",
          isCurrentUser,

          // Work status with defaults (current user shows no status)
          status: (workStatus?.status as WorkStatus) || "offline",
          shareDetails: workStatus?.shareDetails ?? false,
          sessionType: workStatus?.sessionType,
          focusMode: workStatus?.focusMode,
          taskTitle: workStatus?.taskTitle,
          questionTitle: workStatus?.questionTitle,
          timeblockTitle: workStatus?.timeblockTitle,
          expectedEndAt: workStatus?.expectedEndAt,
        };
      },
    );

    // Sort by status priority, then alphabetically by name
    return enrichedMembers.sort((a, b) => {
      const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (statusDiff !== 0) return statusDiff;

      const nameA = getDisplayName(a).toLowerCase();
      const nameB = getDisplayName(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [memberships?.data, teamStatus, user?.id]);

  return {
    members,
    isLoading,
    memberCount: memberships?.data?.length || 0,
  };
}

function getDisplayName(member: MemberWithWorkStatus): string {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  return member.identifier || "Unknown";
}
