import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Users } from "lucide-react";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionSelector } from "./PermissionSelector";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

type PermissionLevel = "view" | "edit" | "manage";

export interface SelectableUser {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
}

export interface SelectableGroup {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}

interface AddPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: SelectableUser[];
  groups: SelectableGroup[];
  existingUserIds: Set<string>;
  existingGroupIds: Set<string>;
  hasEveryonePermission: boolean;
  onAdd: (
    type: "user" | "group" | "all",
    id: string | null,
    permission: PermissionLevel,
  ) => void;
}

export function AddPermissionDialog({
  open,
  onOpenChange,
  users,
  groups,
  existingUserIds,
  existingGroupIds,
  hasEveryonePermission,
  onAdd,
}: AddPermissionDialogProps) {
  const [selectedTab, setSelectedTab] = useState<"user" | "group" | "all">(
    "user",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionLevel>("view");
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserId = useUser()?.user?.id || "";

  // Filter out existing users and the current user (creator)
  const availableUsers = users.filter(
    (u) => !existingUserIds.has(u.id) && u.id !== currentUserId,
  );
  const availableGroups = groups.filter((g) => !existingGroupIds.has(g.id));

  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredGroups = availableGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = () => {
    if (selectedTab === "all") {
      onAdd("all", null, permission);
    } else {
      if (!selectedId) return;
      onAdd(selectedTab, selectedId, permission);
    }
    setSelectedId(null);
    setPermission("view");
    setSearchQuery("");
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Permission</DialogTitle>
          <DialogDescription>Grant access to users or groups</DialogDescription>
        </DialogHeader>

        <UnderlineTabs
          value={selectedTab}
          onValueChange={(v) => setSelectedTab(v as "user" | "group" | "all")}
        >
          <UnderlineTabsList className="grid w-full grid-cols-3">
            <UnderlineTabsTrigger value="user">Users</UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="group">Groups</UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="all" disabled={hasEveryonePermission}>
              Everyone
            </UnderlineTabsTrigger>
          </UnderlineTabsList>

          <UnderlineTabsContent value="user" className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users available
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 ${
                      selectedId === user.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedId(user.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{user.name}</div>
                      {user.email && (
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </UnderlineTabsContent>

          <UnderlineTabsContent value="group" className="space-y-4">
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No groups available
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 ${
                      selectedId === group.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedId(group.id)}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: group.color }}
                    >
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {group.memberCount}{" "}
                        {group.memberCount === 1 ? "member" : "members"}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </UnderlineTabsContent>

          <UnderlineTabsContent value="all" className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-md border bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Everyone</div>
                <div className="text-sm text-muted-foreground">
                  This permission applies to all users in your organization.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Permission level:</span>
              <PermissionSelector value={permission} onChange={setPermission} />
            </div>
          </UnderlineTabsContent>
        </UnderlineTabs>

        {selectedId && selectedTab !== "all" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Permission level:</span>
            <PermissionSelector value={permission} onChange={setPermission} />
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedTab !== "all" && !selectedId}
          >
            Add Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
