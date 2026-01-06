"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAttentionItems, useGmailConnections } from "@/emails/hooks/queries";
import { AttentionItemCard } from "./AttentionItemCard";

export function AttentionItemsList() {
  const [showResolved, setShowResolved] = useState(false);
  const { connections } = useGmailConnections();
  const { items, isLoading } = useAttentionItems({
    status: showResolved ? undefined : "pending",
  });

  const activeConnections = connections.filter(
    (c) => c.syncStatus !== "disconnected",
  );
  const hasConnections = activeConnections.length > 0;

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading attention items...
      </div>
    );
  }

  if (!hasConnections) {
    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="text-muted-foreground">
            Connect a Gmail account to see attention items
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Emails matching your conversion rules
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-resolved"
            checked={showResolved}
            onCheckedChange={(checked) => setShowResolved(checked === true)}
          />
          <Label htmlFor="show-resolved" className="text-sm cursor-pointer">
            Show resolved
          </Label>
        </div>
      </div>

      {/* Items list */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <AttentionItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="text-muted-foreground">
            {showResolved
              ? "No attention items yet"
              : "No pending attention items"}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Emails matching your rules will appear here
          </p>
        </div>
      )}
    </div>
  );
}
