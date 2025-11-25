"use client";

import { Check, Edit3, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

interface CommentMenuProps {
  isAccepted: boolean;
  isAssignee: boolean;
  isAuthor: boolean;
  canEdit: boolean;
  onMarkAsAnswer: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CommentMenu({
  isAccepted,
  isAssignee,
  isAuthor,
  canEdit,
  onMarkAsAnswer,
  onEdit,
  onDelete,
}: CommentMenuProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Show edit/delete menu for authors (hover only) */}
      {isAuthor && canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-3.5 w-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Show mark as answer button for assignees on non-accepted messages (hover only) */}
      {isAssignee && !isAccepted && canEdit && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onMarkAsAnswer}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as answer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Show accepted checkmark always visible when message is accepted */}
      {isAccepted && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-6 w-6 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-green-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Accepted answer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
