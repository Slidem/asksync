"use client";

import { AlertTriangle, ChevronRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmailViewerDialog } from "@/emails/components/EmailViewerDialog";
import { Id } from "@convex/dataModel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EmailTag {
  _id: string;
  name: string;
  color: string;
}

interface AttentionItem {
  _id: Id<"emailAttentionItems">;
  senderEmail: string;
  senderName?: string;
  subject: string;
  snippet: string;
  htmlBody?: string;
  receivedAt: number;
  expectedAnswerTime: number;
  isOverdue: boolean;
  matchesCurrentBlock: boolean;
  status: "pending" | "resolved";
  sourceEmail: string;
  tags: EmailTag[];
}

interface AttentionItemsSectionProps {
  items: AttentionItem[];
}

function AttentionItemRow({
  item,
  onClick,
}: {
  item: AttentionItem;
  onClick: () => void;
}) {
  const getUrgencyText = () => {
    if (item.isOverdue) return "Overdue";
    const hoursUntil =
      (item.expectedAnswerTime - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m left`;
    if (hoursUntil < 24) return `${Math.round(hoursUntil)}h left`;
    return `${Math.round(hoursUntil / 24)}d left`;
  };

  const getUrgencyColor = () => {
    if (item.isOverdue) return "text-red-500";
    const hoursUntil =
      (item.expectedAnswerTime - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < 1) return "text-orange-500";
    if (hoursUntil < 4) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <button
      className={cn(
        "w-full text-left rounded-xl p-4 transition-all cursor-pointer",
        "bg-card shadow-sm hover:shadow-md",
        item.isOverdue &&
          "ring-2 ring-red-500/50 bg-red-50/30 dark:bg-red-950/10",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {item.isOverdue ? (
              <AlertTriangle
                className={cn("h-4 w-4 flex-shrink-0", getUrgencyColor())}
              />
            ) : (
              <Clock
                className={cn("h-4 w-4 flex-shrink-0", getUrgencyColor())}
              />
            )}
            <span className={cn("text-sm font-medium", getUrgencyColor())}>
              {getUrgencyText()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {item.senderName || item.senderEmail}
          </p>
          <h4 className="font-medium text-sm line-clamp-1 mb-2">
            {item.subject}
          </h4>
          <div className="flex flex-wrap gap-1">
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
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-1" />
      </div>
    </button>
  );
}

export function AttentionItemsSection({
  items,
}: AttentionItemsSectionProps): React.ReactNode {
  const [selectedItem, setSelectedItem] = useState<AttentionItem | null>(null);
  const router = useRouter();

  if (items.length === 0) return null;

  const currentItems = items.filter((i) => i.matchesCurrentBlock);
  const upcomingItems = items.filter((i) => !i.matchesCurrentBlock);

  return (
    <>
      <div className="space-y-8">
        {currentItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Current Timeblock
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {currentItems.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {currentItems.map((item) => (
                <AttentionItemRow
                  key={item._id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        )}

        {upcomingItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Upcoming
              </h2>
              <Badge variant="secondary" className="ml-auto">
                {upcomingItems.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <AttentionItemRow
                  key={item._id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/emails")}
        >
          View All Emails
        </Button>
      </div>

      <EmailViewerDialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        item={selectedItem}
      />
    </>
  );
}
