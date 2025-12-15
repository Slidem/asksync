"use client";

import { TeamMemberCard } from "./TeamMemberCard";
import { useTeamStatus } from "../hooks/useTeamStatus";

export function TeamWorkStatus() {
  const { teamStatus, isLoading } = useTeamStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading team status...</p>
      </div>
    );
  }

  if (teamStatus.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No team members found</p>
          <p className="text-sm text-muted-foreground">
            Team members will appear here when they start work sessions
          </p>
        </div>
      </div>
    );
  }

  // Separate by status
  const working = teamStatus.filter((m) => m.status === "working");
  const onBreak = teamStatus.filter((m) => m.status === "break");
  const offline = teamStatus.filter((m) => m.status === "offline");

  return (
    <div className="space-y-6">
      {working.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Working ({working.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {working.map((member) => (
              <TeamMemberCard key={member.userId} member={member} />
            ))}
          </div>
        </div>
      )}

      {onBreak.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            On Break ({onBreak.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {onBreak.map((member) => (
              <TeamMemberCard key={member.userId} member={member} />
            ))}
          </div>
        </div>
      )}

      {offline.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Offline ({offline.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offline.map((member) => (
              <TeamMemberCard key={member.userId} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
