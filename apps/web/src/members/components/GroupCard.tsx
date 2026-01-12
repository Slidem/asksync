import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GroupMembersDialog } from "../dialogs/groupMembersDialog/GroupMembersDialog";
import { GroupWithMemberCount } from "../types";
import { api } from "@convex/api";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { toGroupId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";
import { useMutation } from "convex/react";
import { useState } from "react";

interface GroupCardProps {
  group: GroupWithMemberCount;
  canManage: boolean;
}

export function GroupCard({
  group,
  canManage,
}: GroupCardProps): React.ReactNode {
  const [showMembers, setShowMembers] = useState(false);
  const openEdit = useGroupDialogStore((state) => state.openEdit);
  const deleteGroup = useMutation(api.groups.mutations.deleteGroup);

  const handleEdit = () => {
    openEdit(group.id, group.name, group.description, group.color);
  };

  const handleDelete = () => {
    confirmDialog.show({
      title: "Delete group",
      description: `Are you sure you want to delete "${group.name}"? This will remove all members and permissions.`,
      onConfirm: async () => {
        try {
          await deleteGroup({ groupId: toGroupId(group.id) });
        } catch (error) {
          console.error("Failed to delete group:", error);
          toast.error("Failed to delete group. Please try again.");
        }
      },
    });
  };

  return (
    <Card className="group hover:shadow-md transition-all border-primary/20 hover:border-primary/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="mt-1 w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background"
              style={{
                backgroundColor: group.color,
              }}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {group.description && (
                <CardDescription className="mt-1.5 line-clamp-2">
                  {group.description}
                </CardDescription>
              )}
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setShowMembers(true)}
        >
          <Users className="h-4 w-4" />
          <span>
            {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
          </span>
          {group.memberCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              View
            </Badge>
          )}
        </Button>
      </CardContent>

      <GroupMembersDialog
        groupId={group.id}
        groupName={group.name}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        canManage={canManage}
      />
    </Card>
  );
}
