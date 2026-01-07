"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Mail,
  MoreVertical,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteItem, useResolveItem } from "@/emails/hooks/mutations";
import { Id } from "@convex/dataModel";

interface EmailTag {
  _id: string;
  name: string;
  color: string;
}

interface AttentionItemCardProps {
  item: {
    _id: Id<"emailAttentionItems">;
    senderEmail: string;
    senderName?: string;
    subject: string;
    snippet: string;
    htmlBody?: string;
    receivedAt: number;
    status: "pending" | "resolved";
    sourceEmail: string;
    tags: EmailTag[];
  };
  onClick?: () => void;
}

export function AttentionItemCard({ item, onClick }: AttentionItemCardProps) {
  const { resolveItem, unresolveItem } = useResolveItem();
  const { deleteItem } = useDeleteItem();

  const isResolved = item.status === "resolved";

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isResolved) {
      unresolveItem(item._id);
    } else {
      resolveItem(item._id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(item._id);
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        isResolved ? "opacity-60 bg-muted/30" : ""
      } ${onClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sender and time */}
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag._id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Source account */}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{item.sourceEmail}</span>
          </div>
        </div>

        {/* Actions - prevent click from bubbling to card */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
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
                onClick={handleDelete}
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
