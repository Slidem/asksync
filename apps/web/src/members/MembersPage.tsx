"use client";

import { Mail, UserPlus, Users, UsersRound } from "lucide-react";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { Button } from "@/components/ui/button";
import { GroupDialog } from "@/members/dialogs/groupDialog/GroupDialog";
import { GroupManager } from "@/members/components/GroupManager";
import { InvitationsList } from "@/members/components/InvitationsList";
import { InviteDialog } from "@/members/dialogs/InviteDialog";
import { MembersList } from "@/members/components/MembersList";
import { useOrganization } from "@clerk/nextjs";
import { useState } from "react";

export const MembersPage: React.FC = () => {
  const { membership, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const canManage = membership?.role === "org:admin";
  const memberCount = memberships?.data?.length || 0;
  const invitationCount = invitations?.data?.length || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage organization members, groups, and invitations
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      <UnderlineTabs defaultValue="members" className="w-full">
        <UnderlineTabsList
          className={`grid w-full max-w-md ${
            canManage ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <UnderlineTabsTrigger
            value="members"
            className="gap-2"
            icon={<Users className="h-4 w-4" />}
            badge={memberCount}
          >
            Members
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger
            value="groups"
            className="gap-2"
            icon={<UsersRound className="h-4 w-4" />}
          >
            Groups
          </UnderlineTabsTrigger>
          {canManage && (
            <UnderlineTabsTrigger
              value="invitations"
              className="gap-2"
              icon={<Mail className="h-4 w-4" />}
              badge={invitationCount > 0 ? invitationCount : undefined}
            >
              Invitations
            </UnderlineTabsTrigger>
          )}
        </UnderlineTabsList>

        <UnderlineTabsContent value="members" className="mt-6">
          <MembersList />
        </UnderlineTabsContent>

        <UnderlineTabsContent value="groups" className="mt-6">
          <GroupManager canManage={canManage} />
        </UnderlineTabsContent>

        {canManage && (
          <UnderlineTabsContent value="invitations" className="mt-6">
            <InvitationsList />
          </UnderlineTabsContent>
        )}
      </UnderlineTabs>

      <GroupDialog />
      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};
