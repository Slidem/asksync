import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Plus } from "lucide-react";
import { PermissionGrant, PermissionLevel } from "@asksync/shared";
import { useGroups, useMemberships } from "@/members/queries/queries";

import { AddPermissionDialog } from "./AddPermissionDialog";
import { Button } from "@/components/ui/button";
import { PermissionGrantItem } from "./PermissionGrantItem";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ResourcePermissionsManagerProps {
  grants: PermissionGrant[];
  canEdit: boolean;
  isCreating?: boolean; // Whether managing permissions during resource creation
  onChange: (grants: PermissionGrant[]) => void;
}

export function ResourcePermissionsManager({
  grants,
  canEdit,
  isCreating = false,
  onChange,
}: ResourcePermissionsManagerProps) {
  const users = useMemberships();
  const groups = useGroups();

  const [showAddDialog, setShowAddDialog] = useState(false);

  const existingUserIds = new Set(
    grants.filter((g) => g.type === "user").map((g) => g.userId!),
  );
  const existingGroupIds = new Set(
    grants.filter((g) => g.type === "group").map((g) => g.groupId!),
  );
  const hasEveryonePermission = grants.some((g) => g.type === "all");

  const handleAdd = (
    type: "user" | "group" | "all",
    id: string | null,
    permission: PermissionLevel,
  ) => {
    if (type === "all") {
      const newGrant: PermissionGrant = {
        id: `temp-${Date.now()}`,
        type: "all",
        permission,
        isCreator: false,
      };
      onChange([...grants, newGrant]);
      return;
    }

    const isUser = type === "user";
    const entity = isUser
      ? users.find((u) => u.id === id)
      : groups.find((g) => g.id === id);

    if (!entity) return;

    const newGrant: PermissionGrant = {
      id: `temp-${Date.now()}`,
      type,
      userId: isUser ? (id ?? undefined) : undefined,
      groupId: !isUser ? (id ?? undefined) : undefined,
      permission,
      isCreator: false,
    };

    onChange([...grants, newGrant]);
  };

  const handleUpdate = (id: string, permission: PermissionLevel) => {
    onChange(grants.map((g) => (g.id === id ? { ...g, permission } : g)));
  };

  const handleRemove = (id: string) => {
    onChange(grants.filter((g) => g.id !== id));
  };

  const creatorGrant = grants.find((g) => g.isCreator);
  const otherGrants = grants.filter((g) => !g.isCreator);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Permissions</CardTitle>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              Add
              <Plus className="h-4 w-4 mr-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {grants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isCreating
                ? "Only you will have access. Add permissions below."
                : "No permissions configured"}
            </p>
          ) : (
            <>
              {creatorGrant && (
                <>
                  <PermissionGrantItem
                    grant={creatorGrant}
                    canEdit={canEdit}
                    isCreator={true}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                  {otherGrants.length > 0 && <Separator className="my-2" />}
                </>
              )}

              {otherGrants.map((grant) => (
                <PermissionGrantItem
                  key={grant.id}
                  grant={grant}
                  canEdit={canEdit}
                  isCreator={false}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </>
          )}
        </div>
      </CardContent>

      <AddPermissionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        users={users}
        groups={groups}
        existingUserIds={existingUserIds}
        existingGroupIds={existingGroupIds}
        hasEveryonePermission={hasEveryonePermission}
        onAdd={handleAdd}
      />
    </Card>
  );
}
