"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, MessageCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { Question } from "@asksync/shared";

interface QuestionCardProps {
  question: Question;
  currentUserId?: string;
}

export function QuestionCard({ question, currentUserId }: QuestionCardProps) {
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

  const getTimeUntilAnswer = (expectedTime: number) => {
    const now = Date.now();
    const timeDiff = expectedTime - now;

    if (timeDiff < 0) {
      const overdue = Math.abs(timeDiff);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return { text: `${days}d overdue`, isOverdue: true };
      }
      return { text: `${hours}h ${minutes}m overdue`, isOverdue: true };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return { text: `${days}d remaining`, isOverdue: false };
    }
    return { text: `${hours}h ${minutes}m remaining`, isOverdue: false };
  };

  const timeInfo = getTimeUntilAnswer(question.expectedAnswerTime);
  const isAssignedToUser =
    currentUserId && question.assigneeIds.includes(currentUserId);

  // Get first 3 participants for display (use participantIds)
  const displayParticipantIds = question.participantIds.slice(0, 3);
  const hasMoreParticipants = question.participantIds.length > 3;

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
            </div>

            {/* Participants avatars */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {displayParticipantIds.map((participantId) => (
                <MemberAvatar key={participantId} id={participantId} />
              ))}
              {hasMoreParticipants && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    +{question.participantIds.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
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

            {/* Bottom metadata */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                {/* Time until answer */}
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

                {/* Message count */}
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

                {/* Participant count */}
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
