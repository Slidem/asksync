"use client";

import { ArrowLeft, Calendar, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useMemberships } from "@/members/queries/queries";
import { useUser } from "@clerk/nextjs";

export function CalendarUserSelector() {
  const { user } = useUser();
  const members = useMemberships();
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);
  const setSelectedUserId = useCalendarViewStore(
    (state) => state.setSelectedUserId,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const currentUserId = user?.id;

  const selectedUser = useMemo(() => {
    if (!selectedUserId) {
      return members.find((m) => m.id === currentUserId);
    }
    return members.find((m) => m.id === selectedUserId);
  }, [selectedUserId, members, currentUserId]);

  const filteredMembers = useMemo(() => {
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort: current user first, then alphabetically
    return filtered.sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [members, searchQuery, currentUserId]);

  const displayMembers =
    searchQuery.trim() === "" ? filteredMembers.slice(0, 8) : filteredMembers;

  const handleSelectUser = (userId: string) => {
    if (userId === currentUserId) {
      setSelectedUserId(null);
    } else {
      setSelectedUserId(userId);
    }
    setIsExpanded(false);
    setSearchQuery("");
  };

  const handleBackToMyCalendar = () => {
    setSelectedUserId(null);
    setIsExpanded(false);
  };

  const isViewingOwnCalendar = !selectedUserId;

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center gap-3">
        {/* Calendar Icon */}
        <Calendar className="h-5 w-5 text-muted-foreground" />

        {/* Selected User Display */}
        <div className="flex-1">
          {selectedUser && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-md p-2 transition-colors"
            >
              <Avatar className="h-8 w-8">
                {selectedUser.imageUrl && (
                  <AvatarImage src={selectedUser.imageUrl} />
                )}
                <AvatarFallback className="text-xs">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {isViewingOwnCalendar ? "My Calendar" : selectedUser.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {isViewingOwnCalendar
                    ? "Your schedule"
                    : `${selectedUser.name}'s calendar`}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Back to My Calendar Button (only when viewing others) */}
        {!isViewingOwnCalendar && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToMyCalendar}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            My Calendar
          </Button>
        )}
      </div>

      {/* Expanded User List */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Member List */}
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {displayMembers.length > 0 ? (
              <div className="p-2 space-y-1">
                {displayMembers.map((member) => {
                  const isCurrentUser = member.id === currentUserId;
                  const isSelected = isViewingOwnCalendar
                    ? isCurrentUser
                    : member.id === selectedUserId;

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-muted"
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectUser(member.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectUser(member.id);
                        }
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        {member.imageUrl && (
                          <AvatarImage src={member.imageUrl} />
                        )}
                        <AvatarFallback className="text-xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {searchQuery.trim() === "" && filteredMembers.length > 8 && (
                  <div className="p-2 text-center text-xs text-muted-foreground border-t">
                    Showing 8 of {filteredMembers.length} members. Search to see
                    more.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? `No members found matching "${searchQuery}"`
                  : "No organization members found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
