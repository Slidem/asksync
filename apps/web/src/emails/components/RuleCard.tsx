"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@convex/dataModel";
import { useDeleteRule, useUpdateRule } from "@/emails/hooks/mutations";
import { EditRuleDialog } from "./EditRuleDialog";

interface RuleCardProps {
  rule: {
    _id: Id<"emailConversionRules">;
    name: string;
    senderPattern?: string;
    subjectPattern?: string;
    contentPattern?: string;
    autoTagIds: string[];
    isEnabled: boolean;
    priority: number;
    matchCount?: number;
    lastMatchedAt?: number;
  };
  connectionEmail?: string;
}

export function RuleCard({ rule, connectionEmail }: RuleCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteRule } = useDeleteRule();
  const { updateRule } = useUpdateRule();

  const patterns = [
    rule.senderPattern && `From: ${rule.senderPattern}`,
    rule.subjectPattern && `Subject: ${rule.subjectPattern}`,
    rule.contentPattern && `Content: ${rule.contentPattern}`,
  ].filter(Boolean);

  const handleToggleEnabled = async () => {
    await updateRule({
      ruleId: rule._id,
      isEnabled: !rule.isEnabled,
    });
  };

  return (
    <>
      <div
        className={`p-4 border rounded-lg ${!rule.isEnabled ? "opacity-60" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{rule.name}</h4>
              {!rule.isEnabled && (
                <Badge variant="secondary" className="text-xs">
                  Disabled
                </Badge>
              )}
            </div>

            {connectionEmail && (
              <p className="text-xs text-muted-foreground mb-2">
                Account: {connectionEmail}
              </p>
            )}

            <div className="space-y-1">
              {patterns.map((pattern, i) => (
                <p key={i} className="text-sm text-muted-foreground font-mono">
                  {pattern}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>
                {rule.matchCount || 0} match{rule.matchCount !== 1 && "es"}
              </span>
              {rule.lastMatchedAt && (
                <span>
                  Last:{" "}
                  {formatDistanceToNow(rule.lastMatchedAt, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleEnabled}>
                {rule.isEnabled ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteRule(rule._id, rule.name)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditRuleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        rule={rule}
      />
    </>
  );
}
