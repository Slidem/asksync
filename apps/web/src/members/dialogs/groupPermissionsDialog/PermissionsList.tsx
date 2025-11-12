import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Permission = "view" | "create" | "edit" | "delete";

interface PermissionItem {
  _id: string;
  resourceType: "tags" | "timeblocks";
  resourceId: string;
  permissions: Permission[];
}

interface PermissionsListProps {
  permissions: PermissionItem[];
  onRemove: (permissionId: string) => void;
}

export function PermissionsList({
  permissions,
  onRemove,
}: PermissionsListProps) {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-md">
        No permissions configured for this group
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {permissions.map((perm) => (
        <div
          key={perm._id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">
                {perm.resourceType === "tags" ? "Tag" : "Timeblock"}
              </Badge>
              <span className="text-sm font-medium">
                {perm.resourceId === "*" ? "All" : perm.resourceId}
              </span>
            </div>
            <div className="flex gap-1">
              {perm.permissions.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(perm._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
