"use client";

import { AlertTriangle, Clock, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmailItem } from "@/work/types";
import { cn } from "@/lib/utils";

export interface EmailTag {
  _id: string;
  name: string;
  color: string;
}

interface EmailsPanelProps {
  items: EmailItem[];
  onViewEmail: (item: EmailItem) => void;
}

export function EmailsPanel({
  items,
  onViewEmail,
}: EmailsPanelProps): React.ReactNode {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Mail className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No emails need attention
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Emails matching your current timeblock will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto flex-1">
      {items.map((item) => {
        const hoursUntil =
          (item.expectedAnswerTime - Date.now()) / (1000 * 60 * 60);

        const getUrgencyText = () => {
          if (item.isOverdue) return "Overdue";
          if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m`;
          if (hoursUntil < 24) return `${Math.round(hoursUntil)}h`;
          return `${Math.round(hoursUntil / 24)}d`;
        };

        const getUrgencyColor = () => {
          if (item.isOverdue) return "text-red-500";
          if (hoursUntil < 1) return "text-orange-500";
          if (hoursUntil < 4) return "text-yellow-500";
          return "text-muted-foreground";
        };

        return (
          <button
            key={item._id}
            onClick={() => onViewEmail(item)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-colors",
              "hover:bg-muted/50",
              item.isOverdue &&
                "border-red-500/50 bg-red-50/30 dark:bg-red-950/10",
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.isOverdue ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                ) : hoursUntil < 4 ? (
                  <Clock
                    className={cn("h-3.5 w-3.5 shrink-0", getUrgencyColor())}
                  />
                ) : (
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {item.senderName || item.senderEmail}
                </span>
              </div>
              <span className={cn("text-xs shrink-0", getUrgencyColor())}>
                {getUrgencyText()}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-1">{item.subject}</p>
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag._id}
                    variant="outline"
                    className="text-xs h-5"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {item.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs h-5">
                    +{item.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
