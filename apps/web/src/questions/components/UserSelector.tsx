import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onUserToggle: (userId: string) => void;
  availableUsers: User[];
  placeholder?: string;
  maxSelections?: number;
}

export function UserSelector({
  selectedUserIds,
  onUserToggle,
  availableUsers,
  placeholder = "Search and select users...",
  maxSelections,
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedUsers = availableUsers.filter((user) =>
    selectedUserIds.includes(user.id),
  );

  const unselectedUsers = filteredUsers.filter(
    (user) => !selectedUserIds.includes(user.id),
  );

  // Show first 5 users when search is empty, otherwise show all filtered results
  const displayUsers =
    searchQuery.trim() === "" ? unselectedUsers.slice(0, 5) : unselectedUsers;

  const canAddMore = !maxSelections || selectedUserIds.length < maxSelections;

  return (
    <div className="space-y-4">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Selected ({selectedUsers.length}
              {maxSelections && `/${maxSelections}`})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onUserToggle(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      {canAddMore && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Users */}
          {(searchQuery || canAddMore) && (
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {displayUsers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {displayUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => onUserToggle(user.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onUserToggle(user.id);
                        }
                      }}
                      aria-pressed={false}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchQuery.trim() === "" && unselectedUsers.length > 5 && (
                    <div className="p-2 text-center text-xs text-muted-foreground border-t">
                      Showing 5 of {unselectedUsers.length} members. Search to
                      see more.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? `No users found matching "${searchQuery}"`
                    : "No team members available to assign"}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!canAddMore && maxSelections && (
        <div className="text-xs text-muted-foreground">
          Maximum {maxSelections} user{maxSelections !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
