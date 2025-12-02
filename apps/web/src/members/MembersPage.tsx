"use client";

import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { GroupDialog } from "./dialogs/groupDialog/GroupDialog";
import { GroupManager } from "./components/GroupManager";
import { MembersList } from "./components/MembersList";
import { useOrganization } from "@clerk/nextjs";
import { Users, UsersRound } from "lucide-react";

export function MembersPage() {
  const { membership, memberships } = useOrganization({
    memberships: { infinite: true },
  });
  const canManage = membership?.role === "org:admin";
  const memberCount = memberships?.data?.length || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-2">
          Manage organization members and groups
        </p>
      </div>

      <UnderlineTabs defaultValue="members" className="w-full">
        <UnderlineTabsList className="grid w-full max-w-md grid-cols-2">
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
        </UnderlineTabsList>

        <UnderlineTabsContent value="members" className="mt-6">
          <MembersList />
        </UnderlineTabsContent>

        <UnderlineTabsContent value="groups" className="mt-6">
          <GroupManager canManage={canManage} />
        </UnderlineTabsContent>
      </UnderlineTabs>

      <GroupDialog />
    </div>
  );
}
