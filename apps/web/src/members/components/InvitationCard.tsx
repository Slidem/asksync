"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, Shield, User, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface InvitationCardProps {
  invitation: {
    id: string;
    emailAddress: string;
    role: string;
    createdAt: Date;
    revoke: () => Promise<unknown>;
  };
  canManage: boolean;
}

export function InvitationCard({
  invitation,
  canManage,
}: InvitationCardProps): React.ReactNode {
  const [isRevoking, setIsRevoking] = useState(false);

  const isAdmin = invitation.role === "org:admin";

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await invitation.revoke();
      toast.success("Invitation revoked");
    } catch {
      toast.error("Failed to revoke invitation");
    } finally {
      setIsRevoking(false);
    }
  };

  const sentDate = new Date(invitation.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="group hover:shadow-md transition-all border-primary/20 hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-2 ring-muted">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {invitation.emailAddress}
              </h3>
              <Badge variant="outline" className="text-xs">
                Pending
              </Badge>
              {isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <span>Sent {sentDate}</span>
            </div>

            {!isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Member</span>
              </div>
            )}
          </div>

          {canManage && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
