"use client";

import { Calendar, Check, Mail, RotateCcw, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { useDeleteItem, useResolveItem } from "@/emails/hooks/mutations";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { Id } from "@convex/dataModel";

interface EmailTag {
  _id: string;
  name: string;
  color: string;
}

interface EmailViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  } | null;
}

export function EmailViewerDialog({
  open,
  onOpenChange,
  item,
}: EmailViewerDialogProps): React.ReactNode {
  const { resolveItem, unresolveItem } = useResolveItem();
  const { deleteItem } = useDeleteItem();

  if (!item) return null;

  const isResolved = item.status === "resolved";

  const handleResolve = async () => {
    if (isResolved) {
      await unresolveItem(item._id);
    } else {
      await resolveItem(item._id);
    }
  };

  const handleDelete = () => {
    deleteItem(item._id);
    onOpenChange(false);
  };

  const sanitizedHtml = item.htmlBody
    ? DOMPurify.sanitize(item.htmlBody, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"],
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg pr-8">{item.subject}</DialogTitle>
        </DialogHeader>

        {/* Email metadata */}
        <div className="flex-shrink-0 space-y-2 border-b pb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {item.senderName || item.senderEmail}
            </span>
            {item.senderName && (
              <span className="text-muted-foreground">
                &lt;{item.senderEmail}&gt;
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(item.receivedAt, "PPpp")}</span>
            <span>
              ({formatDistanceToNow(item.receivedAt, { addSuffix: true })})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>To: {item.sourceEmail}</span>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.tags.map((tag) => (
                <Badge
                  key={tag._id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Email content */}
        <div className="flex-1 overflow-y-auto py-4">
          {sanitizedHtml ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-primary [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{item.snippet}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-between items-center border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button
            variant={isResolved ? "outline" : "default"}
            size="sm"
            onClick={handleResolve}
          >
            {isResolved ? (
              <>
                <RotateCcw className="h-4 w-4 mr-1" />
                Mark Pending
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Mark Resolved
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
