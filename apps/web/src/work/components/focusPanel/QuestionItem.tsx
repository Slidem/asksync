"use client";

import { AlertCircle, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { MemberName } from "@/members/components/MemberName";
import { TiptapViewer } from "@/components/editor/TiptapViewer";
import { cn } from "@/lib/utils";

interface QuestionItemProps {
  question: {
    _id: string;
    title: string;
    content: string;
    expectedAnswerTime: number;
    isOverdue: boolean;
    messageCount?: number;
    createdBy: string;
    tags: Array<{
      _id: string;
      name: string;
      color: string;
    }>;
  };
  onViewThread: () => void;
  disabled?: boolean;
}

export function QuestionItem({
  question,
  onViewThread,
  disabled,
}: QuestionItemProps) {
  const getUrgencyColor = () => {
    if (question.isOverdue) return "text-red-500";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return "text-orange-500";
    if (hoursUntil < 4) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getUrgencyText = () => {
    if (question.isOverdue) return "Overdue";

    const now = Date.now();
    const timeUntil = question.expectedAnswerTime - now;
    const hoursUntil = timeUntil / (1000 * 60 * 60);

    if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}m left`;
    if (hoursUntil < 24) return `${Math.round(hoursUntil)}h left`;
    const daysUntil = Math.round(hoursUntil / 24);
    return `${daysUntil}d left`;
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        "border-primary bg-primary/5",
        disabled && "opacity-50",
      )}
      onClick={onViewThread}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewThread();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {/* Header with creator and urgency */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="[&>div]:h-5 [&>div]:w-5 [&>div]:border-0">
            <MemberAvatar id={question.createdBy} showTooltip={false} />
          </div>
          <MemberName
            id={question.createdBy}
            className="text-xs text-muted-foreground truncate"
          />
        </div>
        <div
          className={cn("flex items-center gap-1 text-xs", getUrgencyColor())}
        >
          {question.isOverdue && <AlertCircle className="h-3 w-3" />}
          <span className="font-medium">{getUrgencyText()}</span>
        </div>
      </div>

      {/* Question title */}
      <h5 className="text-sm font-medium mb-1 line-clamp-2">
        {question.title}
      </h5>

      {/* Question content preview */}
      <div className="text-xs text-foreground/80 mb-2 max-h-[2rem] overflow-hidden [&_.tiptap]:text-xs">
        <TiptapViewer content={question.content} />
      </div>

      {/* Tags and actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {question.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag._id}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
          {question.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{question.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {question.messageCount !== undefined && question.messageCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <span>{question.messageCount}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs px-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewThread();
            }}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
