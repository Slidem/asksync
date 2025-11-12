import { useState, useMemo } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { MemberCard } from "./MemberCard";
import { Search } from "lucide-react";

export function MembersList() {
  const { user } = useUser();
  const { memberships, membership } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const currentUserId = user?.id || "";
  const canManage = membership?.role === "org:admin";

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!memberships?.data) return [];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return memberships.data;

    return memberships.data.filter((m) => {
      const firstName = m.publicUserData?.firstName || "";
      const lastName = m.publicUserData?.lastName || "";
      const identifier = m.publicUserData?.identifier || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const email = identifier.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        firstName?.toLowerCase().includes(query) ||
        lastName?.toLowerCase().includes(query)
      );
    });
  }, [memberships?.data, searchQuery]);

  const memberCount = memberships?.data?.length || 0;
  const filteredCount = filteredMembers.length;

  if (!memberships) {
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
          {filteredMembers.map((membership) => (
            <MemberCard
              key={membership.id}
              membership={membership}
              currentUserId={currentUserId}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
