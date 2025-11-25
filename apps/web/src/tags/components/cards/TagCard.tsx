"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Edit3, Eye, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from "@asksync/shared";
import { formatResponseTime } from "@/lib/time";
import { useDeleteTag } from "@/tags/hooks/mutations";
import { useEditTagDialog } from "@/tags/components/dialog/TagDialogContext";

interface TagCardProps {
  tag: Tag;
  showActions?: boolean;
  isOwner?: boolean;
}

export function TagCard({
  tag,
  showActions = true,
  isOwner = false,
}: TagCardProps) {
  const { deleteTag } = useDeleteTag();
  const { openDialog } = useEditTagDialog();

  return (
    <Card
      className="group relative cursor-pointer hover:shadow-lg transition-shadow py-4 px-2 border-primary/20"
      onClick={() => openDialog(tag)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <CardTitle className="text-xl">{tag.name}</CardTitle>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(tag.canEdit || tag.canManage) && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      openDialog(tag);
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {tag.canManage && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTag(tag);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!tag.canEdit && !tag.canManage && (
                  <DropdownMenuItem disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    View only
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {tag.description && (
          <CardDescription>{tag.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {tag.answerMode === "on-demand" ? "On-demand" : "Scheduled"}
            </Badge>

            {tag.answerMode === "on-demand" && tag.responseTimeMinutes && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {formatResponseTime(tag.responseTimeMinutes)}
              </Badge>
            )}

            {!isOwner && (
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 text-muted-foreground"
              >
                {tag.canEdit && tag.canManage ? (
                  "Full access"
                ) : tag.canEdit ? (
                  <>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Can edit
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    View only
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
