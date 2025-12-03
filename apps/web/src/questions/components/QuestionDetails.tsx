"use client";

import { CheckCircle2, Clock, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParticipantsDisplay } from "./ParticipantsDisplay";
import { TiptapViewer } from "@/components/editor/TiptapViewer";
import { getTimeUntilAnswer } from "@/questions/hooks/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Participant {
  id: string;
  isAssignee?: boolean;
  isCreator?: boolean;
}

interface QuestionDetailsProps {
  title: string;
  content: string;
  status: string;
  expectedAnswerTime: number;
  tags?: Tag[];
  participants?: Participant[];
  createdAt: number;
  isAssignee: boolean;
  isCreator: boolean;
  onResolve: () => void;
  onDelete: () => void;
}

export function QuestionDetails({
  title,
  content,
  status,
  expectedAnswerTime,
  tags,
  participants,
  createdAt,
  isAssignee,
  isCreator,
  onResolve,
  onDelete,
}: QuestionDetailsProps) {
  const timeInfo = getTimeUntilAnswer(expectedAnswerTime);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={status === "resolved" ? "outline" : "default"}>
              {status.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span
                className={
                  timeInfo.isOverdue ? "text-destructive font-medium" : ""
                }
              >
                {timeInfo.text}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-3">{title}</h1>
          <div className="text-base leading-relaxed text-muted-foreground">
            <TiptapViewer content={content} />
          </div>
        </div>

        {(isAssignee || isCreator) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAssignee && status !== "resolved" && (
                <DropdownMenuItem onClick={onResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </DropdownMenuItem>
              )}
              {isAssignee && isCreator && status !== "resolved" && (
                <DropdownMenuSeparator />
              )}
              {isCreator && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags
            .filter((tag) => tag !== null)
            .map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  borderColor: tag.color,
                  color: tag.color,
                  backgroundColor: `${tag.color}08`,
                }}
              >
                {tag.name}
              </Badge>
            ))}
        </div>
      )}

      {/* Participants & Created Date */}
      <div className="flex items-center justify-between">
        <ParticipantsDisplay participants={participants || []} />
        <div className="text-sm text-muted-foreground">
          Created {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
