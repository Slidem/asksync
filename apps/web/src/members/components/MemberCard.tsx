"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Shield,
  User,
  Clock,
  CheckSquare,
  MessageCircle,
  Calendar,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMillisecondsToTimeDuration } from "@/lib/date";
import { WorkStatusIndicator } from "@/members/components/WorkStatusIndicator";
import { useTeamMemberTimer } from "@/members/hooks/useTeamMemberTimer";
import { MemberWithWorkStatus } from "@/members/hooks/useMembersWithWorkStatus";

interface MemberCardProps {
  member: MemberWithWorkStatus;
  canManage: boolean;
}

const borderColors = {
  working: "border-l-green-500",
  break: "border-l-blue-500",
  paused: "border-l-yellow-500",
  offline: "border-l-gray-300 dark:border-l-gray-600",
};

const focusModeLabels: Record<string, string> = {
  deep: "Deep Focus",
  normal: "Normal",
  quick: "Quick",
  review: "Review",
  custom: "Custom",
};

const sessionTypeLabels = {
  work: "Work Session",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

export function MemberCard({ member, canManage }: MemberCardProps) {
  const timeRemaining = useTeamMemberTimer({
    expectedEndAt: member.expectedEndAt,
    status: member.status,
  });

  const displayName =
    member.firstName && member.lastName
      ? `${member.firstName} ${member.lastName}`
      : member.identifier;

  const initials =
    member.firstName && member.lastName
      ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
      : member.identifier?.charAt(0).toUpperCase() || "?";

  const isAdmin = member.role === "org:admin";
  const showWorkStatus = !member.isCurrentUser;
  const showDetails =
    showWorkStatus && member.shareDetails && member.status !== "offline";
  const showTimer =
    showWorkStatus && timeRemaining > 0 && member.status !== "offline";

  return (
    <Card
      className={cn(
        "group hover:shadow-md transition-all border-l-4",
        showWorkStatus
          ? borderColors[member.status]
          : "border-l-primary/30",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-muted">
            <AvatarImage src={member.imageUrl} alt={displayName} />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{displayName}</h3>
              {member.isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Mail className="h-3.5 w-3.5" />
              <p className="truncate">{member.identifier}</p>
            </div>

            {/* Role indicator for non-admins */}
            {!isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <User className="h-3 w-3" />
                <span>Member</span>
              </div>
            )}

            {/* Work status indicator (not shown for current user) */}
            {showWorkStatus && <WorkStatusIndicator status={member.status} />}

            {/* Session details */}
            {showDetails && (
              <div className="mt-3 space-y-1.5">
                {member.sessionType && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{sessionTypeLabels[member.sessionType]}</span>
                    {member.focusMode && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-xs">
                          {focusModeLabels[member.focusMode] || member.focusMode}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {member.taskTitle && (
                  <div className="flex items-start gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-1">
                      {member.taskTitle}
                    </span>
                  </div>
                )}

                {member.questionTitle && (
                  <div className="flex items-start gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-1">
                      {member.questionTitle}
                    </span>
                  </div>
                )}

                {member.timeblockTitle && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{member.timeblockTitle}</span>
                  </div>
                )}
              </div>
            )}

            {/* Hidden details message */}
            {showWorkStatus &&
              !member.shareDetails &&
              member.status !== "offline" && (
                <p className="mt-2 text-xs text-muted-foreground italic">
                  Details hidden by user
                </p>
              )}
          </div>

          {/* Timer display */}
          {showTimer && (
            <div className="text-right shrink-0">
              <div className="text-lg font-semibold tabular-nums">
                {formatMillisecondsToTimeDuration(timeRemaining)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>remaining</span>
              </div>
            </div>
          )}

          {canManage && !member.isCurrentUser && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Action buttons will be added in future phases */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
