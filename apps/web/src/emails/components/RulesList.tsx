"use client";

import {
  useConversionRules,
  useGmailConnections,
} from "@/emails/hooks/queries";

import { Button } from "@/components/ui/button";
import { CreateRuleDialog } from "./CreateRuleDialog";
import { Plus } from "lucide-react";
import { RuleCard } from "./RuleCard";
import { useState } from "react";

export function RulesList(): React.ReactNode {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { connections } = useGmailConnections();
  const { rules, isLoading } = useConversionRules();

  const activeConnections = connections.filter(
    (c) => c.syncStatus !== "disconnected",
  );
  const hasConnections = activeConnections.length > 0;

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading rules...
      </div>
    );
  }

  if (!hasConnections) {
    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <div className="text-muted-foreground">
            Connect a Gmail account to create conversion rules
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Rules determine which emails become attention items
        </p>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      {/* Rules list */}
      {rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => {
            const connection = connections.find(
              (c) => c._id === rule.gmailConnectionId,
            );
            return (
              <RuleCard
                key={rule._id}
                rule={rule}
                connectionEmail={connection?.googleEmail}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <div className="space-y-3">
            <div className="text-muted-foreground">No conversion rules yet</div>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create your first rule
            </Button>
          </div>
        </div>
      )}

      <CreateRuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        connections={activeConnections}
      />
    </div>
  );
}
