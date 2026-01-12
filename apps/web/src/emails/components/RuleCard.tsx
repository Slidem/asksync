"use client";

import {
  AlignLeft,
  FileText,
  Mail,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteRule, useUpdateRule } from "@/emails/hooks/mutations";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditRuleDialog } from "@/emails/components/EditRuleDialog";
import { Id } from "@convex/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useTags } from "@/tags/hooks/queries";

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

export function RuleCard({
  rule,
  connectionEmail,
}: RuleCardProps): React.ReactNode {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteRule } = useDeleteRule();
  const { updateRule } = useUpdateRule();
  const { tags } = useTags({});

  const handleToggleEnabled = async () => {
    await updateRule({
      ruleId: rule._id,
      isEnabled: !rule.isEnabled,
    });
  };

  // Get tag objects for display
  const ruleTags = rule.autoTagIds
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean);

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

            {/* Pattern filters with icons */}
            <div className="space-y-1.5 mt-2">
              {rule.senderPattern && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono truncate">
                    {rule.senderPattern}
                  </span>
                </div>
              )}
              {rule.subjectPattern && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono truncate">
                    {rule.subjectPattern}
                  </span>
                </div>
              )}
              {rule.contentPattern && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlignLeft className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono truncate">
                    {rule.contentPattern}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {ruleTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {ruleTags.map((tag) => (
                  <Badge
                    key={tag!.id}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: tag!.color, color: tag!.color }}
                  >
                    {tag!.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
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
