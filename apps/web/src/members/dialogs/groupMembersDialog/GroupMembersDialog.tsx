"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { AvailableMembersList } from "./AvailableMembersList";
import { CurrentMembersList } from "./CurrentMembersList";
import { MemberSearchInput } from "./MemberSearchInput";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { api } from "@convex/api";
import { toGroupId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";

interface GroupMembersDialogProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  canManage: boolean;
}

export function GroupMembersDialog({
  groupId,
  groupName,
  isOpen,
  onClose,
  canManage,
}: GroupMembersDialogProps): React.ReactNode {
  const [searchQuery, setSearchQuery] = useState("");
  const { memberships } = useOrganization({ memberships: { infinite: true } });
  const groupMembers = useQuery(api.groups.queries.getGroupMembers, {
    groupId: toGroupId(groupId),
  });
  const addMember = useMutation(api.groups.mutations.addMemberToGroup);
  const removeMember = useMutation(api.groups.mutations.removeMemberFromGroup);

  const memberUserIds = useMemo(
    () => new Set(groupMembers?.map((m) => m.userId) || []),
    [groupMembers],
  );

  const filteredOrgMembers = useMemo(() => {
    if (!memberships?.data) return [];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return memberships.data;

    return memberships.data.filter((m) => {
      const { firstName, lastName, identifier } = m.publicUserData || {};
      const fullName = `${firstName || ""} ${lastName || ""}`.toLowerCase();
      const email = identifier?.toLowerCase() || "";

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        firstName?.toLowerCase().includes(query) ||
        lastName?.toLowerCase().includes(query)
      );
    });
  }, [memberships?.data, searchQuery]);

  const currentMembers = useMemo(
    () =>
      filteredOrgMembers.filter((m) =>
        memberUserIds.has(m.publicUserData?.userId || ""),
      ),
    [filteredOrgMembers, memberUserIds],
  );

  const availableMembers = useMemo(
    () =>
      filteredOrgMembers.filter(
        (m) => !memberUserIds.has(m.publicUserData?.userId || ""),
      ),
    [filteredOrgMembers, memberUserIds],
  );

  const handleAddMember = async (userId: string) => {
    try {
      await addMember({ groupId: toGroupId(groupId), userId });
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member. Please try again.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({ groupId: toGroupId(groupId), userId });
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-lg max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{groupName} Members</DialogTitle>
              <DialogDescription>
                {canManage
                  ? "Manage group membership by adding or removing members"
                  : "View all members in this group"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
          <MemberSearchInput value={searchQuery} onChange={setSearchQuery} />

          <CurrentMembersList
            members={currentMembers}
            canManage={canManage}
            onRemove={handleRemoveMember}
          />

          {canManage && (
            <>
              <Separator />
              <AvailableMembersList
                members={availableMembers}
                onAdd={handleAddMember}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
