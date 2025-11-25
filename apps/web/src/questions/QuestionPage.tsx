"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit3,
  MessageCircle,
  MoreVertical,
  Save,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  convertConvexQuestion,
  docToMessage,
  toMessageId,
  toQuestionId,
  toThreadId,
} from "@/lib/convexTypes";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@convex/api";
import { toast } from "sonner";

export function QuestionPage({ questionId }: { questionId: string }) {
  const { user } = useUser();
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [manualAnswer, setManualAnswer] = useState("");
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Queries
  const rawQuestion = useQuery(api.questions.queries.getQuestionById, {
    questionId: toQuestionId(questionId),
  });
  const question = rawQuestion ? convertConvexQuestion(rawQuestion) : null;
  const rawMessages = useQuery(
    api.messages.getMessagesByThread,
    question?.threadId ? { threadId: toThreadId(question.threadId) } : "skip",
  );
  const messages = rawMessages?.map(docToMessage);

  // Mutations
  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markAsAccepted = useMutation(
    api.questions.mutations.markMessageAsAccepted,
  );
  const addManualAnswer = useMutation(api.questions.mutations.addManualAnswer);
  const resolveQuestion = useMutation(api.questions.mutations.resolveQuestion);
  const markAsRead = useMutation(api.questions.mutations.markQuestionAsRead);

  const isLoading = question === undefined;
  const isAssignee = user?.id && question?.assigneeIds.includes(user.id);
  const isParticipant = user?.id && question?.participantIds?.includes(user.id);

  // Helper function to get user display name
  const getUserDisplayName = (userId: string) => {
    if (userId === user?.id) return "You";

    const member = memberships?.data?.find(
      (membership) => membership.publicUserData?.userId === userId,
    );

    if (member?.publicUserData) {
      const { firstName, lastName, identifier } = member.publicUserData;
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      return identifier || "Unknown User";
    }

    return userId.slice(0, 8) + "..."; // Fallback to shortened ID
  };

  // Helper function to format timestamp
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Mark question as read when user views it
  useEffect(() => {
    if (question && user?.id && question.unreadBy.includes(user.id)) {
      markAsRead({ questionId: toQuestionId(questionId) });
    }
  }, [question, user?.id, markAsRead, questionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !question?.threadId) return;

    setIsSendingMessage(true);
    try {
      await sendMessage({
        threadId: toThreadId(question.threadId),
        content: newMessage.trim(),
      });
      setNewMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleMarkAsAccepted = async (
    messageId: string,
    isAccepted: boolean,
  ) => {
    if (!isAssignee) {
      toast.error("Only assignees can mark answers as accepted");
      return;
    }

    try {
      await markAsAccepted({
        questionId: toQuestionId(questionId),
        messageId: toMessageId(messageId),
        isAccepted,
      });
      toast.success(
        isAccepted ? "Answer marked as accepted" : "Answer unmarked",
      );
    } catch (error) {
      console.error("Error marking answer:", error);
      toast.error("Failed to update answer status");
    }
  };

  const handleAddManualAnswer = async () => {
    if (!manualAnswer.trim() || !isAssignee) return;

    setIsAddingAnswer(true);
    try {
      await addManualAnswer({
        questionId: toQuestionId(questionId),
        answer: manualAnswer.trim(),
      });
      setManualAnswer("");
      toast.success("Answer added successfully!");
    } catch (error) {
      console.error("Error adding answer:", error);
      toast.error("Failed to add answer");
    } finally {
      setIsAddingAnswer(false);
    }
  };

  const handleResolveQuestion = async () => {
    if (!isAssignee) {
      toast.error("Only assignees can resolve questions");
      return;
    }

    try {
      await resolveQuestion({ questionId: toQuestionId(questionId) });
      toast.success("Question resolved!");
    } catch (error) {
      console.error("Error resolving question:", error);
      toast.error("Failed to resolve question");
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await editMessage({
        messageId: toMessageId(messageId),
        content: editingContent.trim(),
      });
      setEditingMessageId(null);
      setEditingContent("");
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

  const startEditingMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const getTimeUntilAnswer = (expectedTime: number) => {
    const now = Date.now();
    const timeDiff = expectedTime - now;

    if (timeDiff < 0) {
      const overdue = Math.abs(timeDiff);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) return { text: `${days}d overdue`, isOverdue: true };
      return { text: `${hours}h overdue`, isOverdue: true };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return { text: `${days}d remaining`, isOverdue: false };
    return { text: `${hours}h remaining`, isOverdue: false };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Question Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The question you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link href="/questions">
              <Button>Back to Questions</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const timeInfo = getTimeUntilAnswer(question.expectedAnswerTime);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/questions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
        </div>

        {/* Question Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={
                      question.status === "resolved" ? "outline" : "default"
                    }
                  >
                    {question.status.replace("_", " ")}
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

                <CardTitle className="text-2xl mb-3">
                  {question.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {question.content}
                </CardDescription>
              </div>

              {isAssignee && question.status !== "resolved" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleResolveQuestion}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {question.tags
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

            {/* Participants */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Participants:</span>
                  <div className="flex items-center gap-2">
                    {question.participants?.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-1"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {participant.id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {participant.isAssignee && (
                          <Badge variant="secondary" className="text-xs">
                            Assignee
                          </Badge>
                        )}
                        {participant.isCreator && (
                          <Badge variant="outline" className="text-xs">
                            Creator
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created {new Date(question.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Manual Answer Section */}
        {question.manualAnswer && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-900">
                  Accepted Answer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 leading-relaxed">
                {question.manualAnswer}
              </p>
              <div className="mt-3 text-sm text-green-700">
                Added by assignee on{" "}
                {new Date(question.manualAnswerAt!).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Manual Answer (for assignees) */}
        {isAssignee && question.status !== "resolved" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Add Answer</CardTitle>
              <CardDescription>
                Provide a direct answer to this question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your answer here..."
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleAddManualAnswer}
                  disabled={!manualAnswer.trim() || isAddingAnswer}
                  className="w-full"
                >
                  {isAddingAnswer ? "Adding Answer..." : "Add Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message Thread */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Discussion</CardTitle>
                <Badge variant="secondary">
                  {messages?.length || 0}{" "}
                  {(messages?.length || 0) === 1 ? "message" : "messages"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              {messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages
                    .filter((message) => message !== null)
                    .map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {message.createdBy.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {getUserDisplayName(message.createdBy)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.editedAt && (
                                <span className="text-xs text-muted-foreground italic">
                                  (edited)
                                </span>
                              )}
                              {message.isAcceptedAnswer && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Accepted
                                </Badge>
                              )}
                            </div>
                            {message.createdBy === user?.id &&
                              question.status !== "resolved" && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() =>
                                      startEditingMessage(
                                        message.id,
                                        message.content,
                                      )
                                    }
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.isAcceptedAnswer
                                ? "bg-green-50 border border-green-200"
                                : "bg-muted"
                            }`}
                          >
                            {editingMessageId === message.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingContent}
                                  onChange={(e) =>
                                    setEditingContent(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      (e.ctrlKey || e.metaKey)
                                    ) {
                                      e.preventDefault();
                                      handleEditMessage(message.id);
                                    }
                                    if (e.key === "Escape") {
                                      e.preventDefault();
                                      cancelEditing();
                                    }
                                  }}
                                  className="text-sm resize-none"
                                  rows={3}
                                  placeholder="Edit your message... (Ctrl+Enter to save, Esc to cancel)"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleEditMessage(message.id)
                                    }
                                    disabled={!editingContent.trim()}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                            )}
                          </div>
                          {isAssignee &&
                            question.status !== "resolved" &&
                            editingMessageId !== message.id && (
                              <div className="mt-2 flex items-center gap-2">
                                {!message.isAcceptedAnswer ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleMarkAsAccepted(message.id, true)
                                    }
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Mark as Answer
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleMarkAsAccepted(message.id, false)
                                    }
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Unmark Answer
                                  </Button>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}

              {/* Message Input */}
              {isParticipant && question.status !== "resolved" && (
                <div className="border-t pt-4">
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
                      disabled={!newMessage.trim() || isSendingMessage}
                      size="sm"
                    >
                      {isSendingMessage ? (
                        "Sending..."
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
