"use client";

import { MessageCircle, Send } from "lucide-react";
import { toMessageId, toQuestionId, toThreadId } from "@/lib/convexTypes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageItem } from "./MessageItem";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
  editedAt?: number;
  isAcceptedAnswer?: boolean;
}

interface DiscussionThreadProps {
  threadId: string;
  questionId: string;
  messages: Message[];
  isAssignee: boolean;
  isParticipant: boolean;
  isResolved: boolean;
}

export function DiscussionThread({
  threadId,
  questionId,
  messages,
  isAssignee,
  isParticipant,
  isResolved,
}: DiscussionThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markAsAccepted = useMutation(
    api.questions.mutations.markMessageAsAccepted,
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage({
        threadId: toThreadId(threadId),
        content: newMessage.trim(),
      });
      setNewMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage({
        messageId: toMessageId(messageId),
        content,
      });
      toast.success("Message updated!");
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await deleteMessage({ messageId: toMessageId(messageId) });
      toast.success("Message deleted!");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleMarkAsAnswer = async (messageId: string) => {
    try {
      await markAsAccepted({
        questionId: toQuestionId(questionId),
        messageId: toMessageId(messageId),
        isAccepted: true,
      });
      toast.success("Answer marked as accepted");
    } catch (error) {
      console.error("Error marking answer:", error);
      toast.error("Failed to mark answer");
    }
  };

  return (
    <div className="space-y-4">
      {/* Thread Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Discussion</h3>
        <Badge variant="secondary">
          {messages?.length || 0}{" "}
          {(messages?.length || 0) === 1 ? "message" : "messages"}
        </Badge>
      </div>

      {/* Messages */}
      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages
            .filter((message) => message !== null)
            .map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isAssignee={isAssignee}
                isResolved={isResolved}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onMarkAsAnswer={handleMarkAsAnswer}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}

      {/* Message Input */}
      {isParticipant && !isResolved && (
        <div className="pt-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message... (Enter to send)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              {isSending ? "Sending..." : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
