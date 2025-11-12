"use client";

import { GroupDialog } from "./dialogs/groupDialog/GroupDialog";
import { GroupManager } from "./components/GroupManager";
import { MembersList } from "./components/MembersList";
import { Separator } from "@/components/ui/separator";
import { useOrganization } from "@clerk/nextjs";

export function MembersPage() {
  const { membership } = useOrganization();
  const canManage = membership?.role === "org:admin";

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground mt-2">
          View and manage organization members and groups
        </p>
      </div>

      <MembersList />
      <Separator />
      <GroupManager canManage={canManage} />
      <GroupDialog />
    </div>
  );
}
