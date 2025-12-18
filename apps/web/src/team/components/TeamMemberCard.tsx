"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Clock } from "lucide-react";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { MemberName } from "@/members/components/MemberName";
import { WorkStatusIndicator } from "@/work/components/WorkStatusIndicator";
import { formatTime } from "@/work/utils/timeFormatting";

type WorkStatus = "working" | "break" | "paused" | "offline";

interface TeamMemberCardProps {
  member: {
    userId: string;
    status: WorkStatus;
    shareDetails: boolean;
    sessionType?: "work" | "shortBreak" | "longBreak";
    focusMode?: string;
    timeRemaining?: number;
    taskTitle?: string;
    questionTitle?: string;
    timeblockTitle?: string;
  };
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const focusModeLabels: Record<string, string> = {
    deep: "Deep Focus",
    normal: "Normal Focus",
    quick: "Quick Focus",
    review: "Review",
    custom: "Custom",
  };

  const sessionTypeLabels = {
    work: "Work",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MemberAvatar id={member.userId} />
              <div>
                <MemberName id={member.userId} className="font-medium" />
                <WorkStatusIndicator status={member.status} />
              </div>
            </div>
          </div>

          {member.shareDetails && member.status !== "offline" && (
            <div className="space-y-2 text-sm">
              {member.sessionType && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{sessionTypeLabels[member.sessionType]}</span>
                  {member.focusMode && (
                    <span className="text-xs">
                      {focusModeLabels[member.focusMode] || member.focusMode}
                    </span>
                  )}
                </div>
              )}

              {member.timeRemaining !== undefined &&
                member.timeRemaining > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {formatTime(Math.floor(member.timeRemaining / 1000))}{" "}
                      remaining
                    </span>
                  </div>
                )}

              {member.taskTitle && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Working on: </span>
                  <span className="font-medium line-clamp-1">
                    {member.taskTitle}
                  </span>
                </div>
              )}

              {member.questionTitle && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Answering: </span>
                  <span className="font-medium line-clamp-1">
                    {member.questionTitle}
                  </span>
                </div>
              )}

              {member.timeblockTitle && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Timeblock: </span>
                  <span className="font-medium line-clamp-1">
                    {member.timeblockTitle}
                  </span>
                </div>
              )}
            </div>
          )}

          {!member.shareDetails && member.status !== "offline" && (
            <p className="text-xs text-muted-foreground italic">
              Details hidden by user
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
