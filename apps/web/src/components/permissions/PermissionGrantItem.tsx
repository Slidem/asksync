import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X } from "lucide-react";
import { useGroups, useMemberships } from "@/members/queries/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionGrant } from "@asksync/shared";
import { PermissionSelector } from "./PermissionSelector";
import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";

type PermissionLevel = "view" | "edit" | "manage";

interface PermissionGrantItemProps {
  grant: PermissionGrant;
  canEdit: boolean;
  isCreator?: boolean;
  onUpdate: (id: string, permission: PermissionLevel) => void;
  onRemove: (id: string) => void;
}

export function PermissionGrantItem({
  grant,
  canEdit,
  isCreator = false,
  onUpdate,
  onRemove,
}: PermissionGrantItemProps): React.ReactNode {
  const { user } = useUser();
  const users = useMemberships();
  const groups = useGroups();

  const { name, imageUrl, color } = useMemo(() => {
    if (grant.type === "user") {
      const user = users.find((u) => u.id === grant.userId);
      return {
        name: user ? user.name : "Unknown User",
        imageUrl: user ? user.imageUrl : undefined,
        color: undefined,
      };
    }

    if (grant.type === "group") {
      const group = groups.find((g) => g.id === grant.groupId);
      return {
        name: group ? group.name : "Unknown Group",
        imageUrl: undefined,
        color: group ? group.color : undefined,
      };
    }

    return {
      name: "Everyone",
      imageUrl: undefined,
      color: undefined,
    };
  }, [grant, groups, users]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {grant.type === "user" ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        ) : (
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: color || "#6b7280" }}
          >
            <Users className="h-4 w-4 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {name}
              {grant.userId === user?.id && (
                <span className="text-muted-foreground ml-1">(You)</span>
              )}
            </span>
            {grant.type === "group" && <Badge variant="outline">Group</Badge>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <PermissionSelector
          value={grant.permission}
          onChange={(permission) => onUpdate(grant.id, permission)}
          disabled={!canEdit || isCreator}
        />
        {canEdit && !isCreator && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(grant.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
