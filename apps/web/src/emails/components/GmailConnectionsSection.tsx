"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrganization, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initiateGmailOAuth, isGmailOAuthConfigured } from "@/lib/gmailOAuth";
import { useGmailConnections } from "@/emails/hooks/queries";
import { useDisconnectGmail } from "@/emails/hooks/mutations";

export function GmailConnectionsSection() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { connections, isLoading } = useGmailConnections();
  const { disconnectAccount, isDisconnecting } = useDisconnectGmail();

  const oauthConfigured = isGmailOAuthConfigured();

  const handleConnect = () => {
    if (!user?.id || !organization?.id) return;
    setIsConnecting(true);
    initiateGmailOAuth({
      userId: user.id,
      orgId: organization.id,
    });
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="h-3 w-3 text-green-500" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case "disconnected":
        return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const activeConnections = connections.filter(
    (c) => c.syncStatus !== "disconnected",
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          {activeConnections.length > 0 ? (
            <>
              {activeConnections.length} Gmail{" "}
              {activeConnections.length === 1 ? "account" : "accounts"}
            </>
          ) : (
            "Connect Gmail"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gmail Connections</DialogTitle>
          <DialogDescription>
            Connect Gmail accounts to create attention items from matching
            emails
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Connected accounts */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {connections
                .filter((c) => c.syncStatus !== "disconnected")
                .map((conn) => (
                  <div
                    key={conn._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {conn.googleEmail}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getSyncStatusIcon(conn.syncStatus)}
                          <span>
                            {conn.syncStatus === "active" && conn.lastSyncedAt
                              ? `Synced ${formatDistanceToNow(conn.lastSyncedAt, { addSuffix: true })}`
                              : conn.syncStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() =>
                        disconnectAccount(conn._id, conn.googleEmail)
                      }
                      disabled={isDisconnecting}
                      title="Disconnect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </>
          )}

          {/* Add new connection */}
          {oauthConfigured ? (
            <Button
              onClick={handleConnect}
              className="w-full gap-2"
              variant="outline"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Connect Gmail Account
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium">Gmail</h4>
                  <p className="text-sm text-muted-foreground">
                    OAuth not configured
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Setup Required</Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
