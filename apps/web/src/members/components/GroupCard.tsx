import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Users, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GroupMembersDialog } from "../dialogs/groupMembersDialog/GroupMembersDialog";
import { GroupPermissionsDialog } from "../dialogs/groupPermissionsDialog/GroupPermissionsDialog";
import { GroupWithMemberCount } from "@/members/model";
import { api } from "@convex/api";
import { toGroupId } from "@/lib/convexTypes";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";
import { useMutation } from "convex/react";
import { useState } from "react";

interface GroupCardProps {
  group: GroupWithMemberCount;
  canManage: boolean;
}

export function GroupCard({ group, canManage }: GroupCardProps) {
  const [showMembers, setShowMembers] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const openEdit = useGroupDialogStore((state) => state.openEdit);
  const deleteGroup = useMutation(api.groups.mutations.deleteGroup);

  const handleEdit = () => {
    openEdit(group._id, group.name, group.description, group.color);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${group.name}"? This will remove all members and permissions.`,
      )
    ) {
      return;
    }

    try {
      await deleteGroup({ groupId: toGroupId(group._id) });
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <div>
              <h3 className="font-semibold">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setShowMembers(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          <span>
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
        </Button>
        {canManage && (
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowPermissions(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            <span>Manage permissions</span>
          </Button>
        )}
      </CardContent>

      <GroupMembersDialog
        groupId={group._id}
        groupName={group.name}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        canManage={canManage}
      />

      {canManage && (
        <GroupPermissionsDialog
          groupId={group._id}
          groupName={group.name}
          isOpen={showPermissions}
          onClose={() => setShowPermissions(false)}
        />
      )}
    </Card>
  );
}
