import { Button } from "@/components/ui/button";
import { GroupCard } from "./GroupCard";
import { GroupWithMemberCount } from "../types";
import { Plus } from "lucide-react";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";
import { useGroups } from "@/members/queries/queries";

interface GroupManagerProps {
  canManage: boolean;
}

export function GroupManager({
  canManage,
}: GroupManagerProps): React.ReactNode {
  const groups = useGroups();
  const openCreate = useGroupDialogStore((state) => state.openCreate);

  if (!groups) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Groups</h2>
          <p className="text-sm text-muted-foreground">
            Organize members and manage permissions
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {canManage
              ? "No groups yet. Create one to get started."
              : "No groups in this organization"}
          </p>
          {canManage && (
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group: GroupWithMemberCount) => (
            <GroupCard key={group.id} group={group} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
