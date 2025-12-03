"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Crown, MessageCircle, Settings, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Question } from "@asksync/shared";
import { getTimeUntilAnswer } from "@/questions/hooks/utils";
import { useDeleteQuestion } from "@/questions/hooks/mutations";
import { useRouter } from "next/navigation";
import { MemberAvatar } from "@/members/components/MemberAvatar";

interface QuestionCardProps {
  question: Question;
  currentUserId?: string;
}

export function QuestionCard({ question, currentUserId }: QuestionCardProps) {
  const { deleteQuestion } = useDeleteQuestion();
  const router = useRouter();
  const isCreator = currentUserId === question.createdBy;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const deleted = await deleteQuestion(question);
    if (deleted) {
      router.refresh();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "assigned":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in_progress":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "answered":
        return "text-green-600 bg-green-50 border-green-200";
      case "resolved":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const timeInfo = getTimeUntilAnswer(question.expectedAnswerTime);
  const isAssignedToUser =
    currentUserId && question.assigneeIds.includes(currentUserId);
  return (
    <Link href={`/questions/${question.id}`} className="block">
      <Card className="hover:shadow-md transition-all duration-200 border-primary/20 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(question.status)}`}
                >
                  {question.status.replace("_", " ")}
                </Badge>
                {isCreator && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 gap-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <Crown className="h-3 w-3" />
                    Owner
                  </Badge>
                )}
                {isAssignedToUser && (
                  <Badge variant="default" className="text-xs">
                    Assigned to you
                  </Badge>
                )}
              </div>

              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {question.title}
              </CardTitle>

              <CardDescription className="mt-2 line-clamp-2 text-sm">
                {question.content}
              </CardDescription>

              {!isCreator && question.createdBy && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>Created by</span>
                  <MemberAvatar id={question.createdBy} showTooltip={true} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Management menu for creators */}
              {isCreator && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.preventDefault()}
                  >
                    <button className="h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded-md">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Question options</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Assignees */}
            {!isAssignedToUser &&
              question.assigneeIds &&
              question.assigneeIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Assigned to:
                  </span>
                  <div className="flex items-center gap-1">
                    {question.assigneeIds.map((assigneeId) => (
                      <MemberAvatar
                        key={assigneeId}
                        id={assigneeId}
                        showTooltip={true}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: `${tag.color}08`,
                    }}
                    className="text-xs font-medium"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                {question.status !== "resolved" && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span
                      className={
                        timeInfo.isOverdue ? "text-destructive font-medium" : ""
                      }
                    >
                      {timeInfo.text}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {question.messageCount || 0}
                    {question.hasUnread && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 px-1.5 text-xs"
                      >
                        New
                      </Badge>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{question.participantIds.length}</span>
                </div>
              </div>

              {/* Created date */}
              <div className="text-xs text-muted-foreground">
                {new Date(question.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year:
                    new Date(question.createdAt).getFullYear() !==
                    new Date().getFullYear()
                      ? "numeric"
                      : undefined,
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
