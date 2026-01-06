"use client";

import { Check, MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteItem, useResolveItem } from "@/emails/hooks/mutations";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id } from "@convex/dataModel";
import { formatDistanceToNow } from "date-fns";

interface AttentionItemCardProps {
  item: {
    _id: Id<"emailAttentionItems">;
    senderEmail: string;
    senderName?: string;
    subject: string;
    snippet: string;
    receivedAt: number;
    status: "pending" | "resolved";
    sourceEmail: string;
    tagIds: string[];
  };
}

export function AttentionItemCard({ item }: AttentionItemCardProps) {
  const { resolveItem, unresolveItem } = useResolveItem();
  const { deleteItem } = useDeleteItem();

  const isResolved = item.status === "resolved";

  const handleToggleStatus = () => {
    if (isResolved) {
      unresolveItem(item._id);
    } else {
      resolveItem(item._id);
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg ${isResolved ? "opacity-60 bg-muted/30" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sender and time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">
              {item.senderName || item.senderEmail}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(item.receivedAt, { addSuffix: true })}
            </span>
            {isResolved && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Resolved
              </Badge>
            )}
          </div>

          {/* Subject */}
          <h4 className="font-medium text-sm mb-1 truncate">{item.subject}</h4>

          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.snippet}
          </p>

          {/* Source account */}
          <p className="text-xs text-muted-foreground mt-2">
            From: {item.sourceEmail}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={isResolved ? "outline" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            className="gap-1"
          >
            {isResolved ? (
              <>
                <RotateCcw className="h-3 w-3" />
                Unresolve
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Resolve
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteItem(item._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
