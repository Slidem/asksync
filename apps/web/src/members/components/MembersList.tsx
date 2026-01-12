"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { MemberCard } from "@/members/components/MemberCard";
import { Search } from "lucide-react";
import { useMembersWithWorkStatus } from "@/members/hooks/useMembersWithWorkStatus";
import { useOrganization } from "@clerk/nextjs";

export const MembersList: React.FC = () => {
  const { membership } = useOrganization();
  const { members, isLoading, memberCount } = useMembersWithWorkStatus();

  const [searchQuery, setSearchQuery] = useState("");

  const canManage = membership?.role === "org:admin";

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return members;

    return members.filter((m) => {
      const firstName = m.firstName || "";
      const lastName = m.lastName || "";
      const identifier = m.identifier || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const email = identifier.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        firstName?.toLowerCase().includes(query) ||
        lastName?.toLowerCase().includes(query)
      );
    });
  }, [members, searchQuery]);

  const filteredCount = filteredMembers.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Member count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? (
            <>
              Showing {filteredCount} of {memberCount} members
            </>
          ) : (
            <>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </>
          )}
        </p>
      </div>

      {/* Members list */}
      {filteredCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No members found matching your search"
              : "No members in this organization"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
};
