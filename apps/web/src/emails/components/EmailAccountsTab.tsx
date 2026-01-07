"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initiateGmailOAuth, isGmailOAuthConfigured } from "@/lib/gmailOAuth";
import { useGmailConnections } from "@/emails/hooks/queries";
import {
  useDisconnectGmail,
  useTriggerGmailSync,
} from "@/emails/hooks/mutations";

export function EmailAccountsTab() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isConnecting, setIsConnecting] = useState(false);

  const { connections, isLoading } = useGmailConnections();
  const { disconnectAccount, isDisconnecting } = useDisconnectGmail();
  const { triggerSync, isSyncing } = useTriggerGmailSync();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6">
      {/* Connected accounts */}
      {activeConnections.map((conn) => (
        <div
          key={conn._id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{conn.googleEmail}</h4>
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => triggerSync(conn._id)}
              disabled={isSyncing}
              title="Sync now"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => disconnectAccount(conn._id, conn.googleEmail)}
              disabled={isDisconnecting}
              title="Disconnect"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add new connection */}
      {oauthConfigured ? (
        <div className="p-4 border rounded-lg border-dashed">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium">Connect Gmail Account</h4>
              <p className="text-xs text-muted-foreground">
                Sync emails to create attention items
              </p>
            </div>
          </div>
          <Button
            onClick={handleConnect}
            className="w-full gap-2"
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
        </div>
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
  );
}
