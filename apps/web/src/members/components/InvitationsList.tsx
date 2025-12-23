"use client";

import { useOrganization } from "@clerk/nextjs";
import { InvitationCard } from "@/members/components/InvitationCard";
import { Mail } from "lucide-react";

export function InvitationsList() {
  const { invitations, membership } = useOrganization({
    invitations: { infinite: true },
  });

  const canManage = membership?.role === "org:admin";
  const pendingInvitations = invitations?.data || [];

  if (invitations === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading invitations...</p>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-2">No pending invitations</p>
        <p className="text-sm text-muted-foreground">
          Use the &quot;Invite&quot; button to invite new members
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {pendingInvitations.length} pending{" "}
        {pendingInvitations.length === 1 ? "invitation" : "invitations"}
      </p>

      <div className="grid gap-3">
        {pendingInvitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}
