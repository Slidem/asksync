"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { useEventDialogStore } from "../eventDialogStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cloud, Check, AlertCircle, Loader2 } from "lucide-react";
import React from "react";

/**
 * Google Calendar sync toggle for the event dialog.
 * Only shown for AskSync-created events.
 */
export const EventGoogleSyncField = React.memo(() => {
  const connections = useQuery(api.googleCalendar.queries.listConnections);
  const { formFields, setFormFields, eventMetadata } = useEventDialogStore();

  // Only show for AskSync events
  if (eventMetadata.source !== "asksync") {
    return null;
  }

  // No connections available
  if (!connections || connections.length === 0) {
    return null;
  }

  const activeConnections = connections.filter((c) => c.isEnabled);
  if (activeConnections.length === 0) {
    return null;
  }

  const handleSyncToggle = (checked: boolean) => {
    setFormFields({
      syncToGoogle: checked,
      // Auto-select first connection if enabling and none selected
      googleConnectionId:
        checked && !formFields.googleConnectionId
          ? activeConnections[0]._id
          : formFields.googleConnectionId,
    });
  };

  const handleConnectionChange = (connectionId: string) => {
    setFormFields({ googleConnectionId: connectionId });
  };

  const selectedConnection = activeConnections.find(
    (c) => c._id === formFields.googleConnectionId,
  );

  const getSyncStatusIcon = () => {
    if (!selectedConnection) return null;
    switch (selectedConnection.syncStatus) {
      case "active":
        return <Check className="h-3 w-3 text-green-500" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />;
    }
  };

  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="sync-to-google" className="text-sm font-medium">
            Sync to Google Calendar
          </Label>
        </div>
        <Switch
          id="sync-to-google"
          checked={formFields.syncToGoogle}
          onCheckedChange={handleSyncToggle}
        />
      </div>

      {formFields.syncToGoogle && activeConnections.length > 1 && (
        <div className="flex items-center gap-3 pl-6">
          <Label className="text-sm text-muted-foreground">Account:</Label>
          <Select
            value={formFields.googleConnectionId || ""}
            onValueChange={handleConnectionChange}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {activeConnections.map((conn) => (
                <SelectItem key={conn._id} value={conn._id}>
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon()}
                    <span className="truncate">{conn.googleEmail}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formFields.syncToGoogle && activeConnections.length === 1 && (
        <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
          {getSyncStatusIcon()}
          <span>{activeConnections[0].googleEmail}</span>
        </div>
      )}
    </div>
  );
});

EventGoogleSyncField.displayName = "EventGoogleSyncField";
