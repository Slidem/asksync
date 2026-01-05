"use client";

import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Settings,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  initiateGoogleOAuth,
  isGoogleOAuthConfigured,
} from "@/lib/googleOAuth";
import { useMutation, useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoogleCalendarVisibility } from "@asksync/shared";
import { Id } from "@convex/dataModel";
import { Label } from "@/components/ui/label";
import { api } from "@convex/api";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export const IntegrationsDialog = () => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [visibility, setVisibility] =
    useState<GoogleCalendarVisibility>("public");
  const [isConnecting, setIsConnecting] = useState(false);

  const connections = useQuery(api.googleCalendar.queries.listConnections);
  const disconnectMutation = useMutation(
    api.googleCalendar.mutations.disconnectAccount,
  );
  const updateVisibilityMutation = useMutation(
    api.googleCalendar.mutations.updateVisibility,
  );
  const triggerSyncMutation = useMutation(
    api.googleCalendar.mutations.triggerSync,
  );

  const oauthConfigured = isGoogleOAuthConfigured();

  const handleConnect = () => {
    if (!user?.id || !organization?.id) return;
    setIsConnecting(true);
    initiateGoogleOAuth({
      userId: user.id,
      orgId: organization.id,
      visibility,
    });
  };

  const handleDisconnect = async (connectionId: string) => {
    await disconnectMutation({
      connectionId: connectionId as Id<"googleCalendarConnections">,
    });
  };

  const handleVisibilityChange = async (
    connectionId: string,
    newVisibility: GoogleCalendarVisibility,
  ) => {
    await updateVisibilityMutation({
      connectionId: connectionId as Id<"googleCalendarConnections">,
      visibility: newVisibility,
    });
  };

  const handleSync = async (connectionId: string) => {
    await triggerSyncMutation({
      connectionId: connectionId as Id<"googleCalendarConnections">,
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar Integrations</DialogTitle>
          <DialogDescription>
            Connect calendar services for bi-directional sync.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Connected Google Accounts */}
          {connections?.map((conn) => (
            <div
              key={conn._id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">G</span>
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
              <div className="flex items-center gap-2">
                <Select
                  value={conn.visibility}
                  onValueChange={(v) =>
                    handleVisibilityChange(
                      conn._id,
                      v as GoogleCalendarVisibility,
                    )
                  }
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleSync(conn._id)}
                  title="Sync now"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDisconnect(conn._id)}
                  title="Disconnect"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add New Google Connection */}
          {oauthConfigured ? (
            <div className="p-4 border rounded-lg border-dashed">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">G</span>
                </div>
                <div>
                  <h4 className="font-medium">Connect Google Calendar</h4>
                  <p className="text-xs text-muted-foreground">
                    Sync events from your Google account
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Label className="text-sm">Default visibility:</Label>
                <Select
                  value={visibility}
                  onValueChange={(v) =>
                    setVisibility(v as GoogleCalendarVisibility)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      Public - Show details
                    </SelectItem>
                    <SelectItem value="hidden">
                      Hidden - Show as Busy
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Google Account"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">G</span>
                </div>
                <div>
                  <h4 className="font-medium">Google Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    OAuth not configured
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Setup Required</Badge>
            </div>
          )}

          {/* Outlook - Coming Soon */}
          <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">O</span>
              </div>
              <div>
                <h4 className="font-medium">Outlook</h4>
                <p className="text-sm text-muted-foreground">
                  Sync with Microsoft Outlook
                </p>
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
