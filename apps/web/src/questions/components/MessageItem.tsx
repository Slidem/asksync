"use client";

import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommentMenu } from "./CommentMenu";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { TiptapViewer } from "@/components/editor/TiptapViewer";
import { formatMessageTime } from "@/questions/hooks/utils";
import { useMemberships } from "@/members/queries/queries";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
  editedAt?: number;
  isAcceptedAnswer?: boolean;
}

interface MessageItemProps {
  message: Message;
  isAssignee: boolean;
  isResolved: boolean;
  onEdit: (
    messageId: string,
    content: string,
    contentPlaintext: string,
  ) => Promise<void>;
  onDelete: (messageId: string) => void;
  onMarkAsAnswer: (messageId: string) => void;
}

export function MessageItem({
  message,
  isAssignee,
  isResolved,
  onEdit,
  onDelete,
  onMarkAsAnswer,
}: MessageItemProps) {
  const { user } = useUser();
  const memberships = useMemberships();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [editContentPlaintext, setEditContentPlaintext] = useState("");
  const [showTimestamp, setShowTimestamp] = useState(false);

  const isOwnMessage = user?.id === message.createdBy;
  const isAuthor = isOwnMessage;

  const member = memberships?.find((m) => m.id === message.createdBy);
  const displayName = isOwnMessage
    ? "You"
    : member?.name || message.createdBy.slice(0, 8) + "...";

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await onEdit(message.id, editContent.trim(), editContentPlaintext.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex gap-3 group ${isOwnMessage ? "justify-end" : ""}`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {!isOwnMessage && <MemberAvatar id={message.createdBy} />}

      <div className="flex flex-col max-w-[85%]">
        <div
          className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}
        >
          <span className="text-sm font-medium">{displayName}</span>
          {showTimestamp && (
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.createdAt)}
            </span>
          )}
          {message.editedAt && (
            <span className="text-xs text-muted-foreground italic">
              (edited)
            </span>
          )}
        </div>

        <div>
          {isEditing ? (
            <div className="space-y-2 min-w-[300px]">
              <TiptapEditor
                value={editContent}
                onChange={(html, plaintext) => {
                  setEditContent(html);
                  setEditContentPlaintext(plaintext);
                }}
                placeholder="Edit message..."
                minHeight={80}
                onSubmit={handleSaveEdit}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.isAcceptedAnswer
                    ? "bg-green-50 border border-green-200"
                    : isOwnMessage
                      ? "bg-primary/10"
                      : "border border-border"
                }`}
              >
                <TiptapViewer content={message.content} />
              </div>

              <div
                className={`absolute top-2 ${isOwnMessage ? "left-0 -translate-x-full pl-2" : "right-0 translate-x-full pr-2"}`}
              >
                <CommentMenu
                  isAccepted={message.isAcceptedAnswer || false}
                  isAssignee={isAssignee}
                  isAuthor={isAuthor}
                  canEdit={!isResolved}
                  onMarkAsAnswer={() => onMarkAsAnswer(message.id)}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => onDelete(message.id)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isOwnMessage && <MemberAvatar id={message.createdBy} />}
    </div>
  );
}
