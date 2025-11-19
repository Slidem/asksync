"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              {memberCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <UsersRound className="h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <MembersList />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupManager canManage={canManage} />
        </TabsContent>
      </Tabs>

      <GroupDialog />
    </div>
  );
}
