"use client";

import { AlertCircle, Calendar, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface TagUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagName: string;
  usage: {
    questions: Array<{ _id: string; title: string }>;
    timeblocks: Array<{
      _id: string;
      title: string;
      startTime: number;
      endTime: number;
    }>;
    totalQuestions: number;
    totalTimeblocks: number;
  };
}

export function TagUsageDialog({
  open,
  onOpenChange,
  tagName,
  usage,
}: TagUsageDialogProps) {
  const hasQuestions = usage.totalQuestions > 0;
  const hasTimeblocks = usage.totalTimeblocks > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Cannot Delete Tag</DialogTitle>
          </div>
          <DialogDescription>
            The tag &quot;{tagName}&quot; is currently in use and cannot be
            deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            {hasQuestions && (
              <Badge variant="secondary" className="text-sm px-3 py-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                {usage.totalQuestions} Question
                {usage.totalQuestions !== 1 ? "s" : ""}
              </Badge>
            )}
            {hasTimeblocks && (
              <Badge variant="secondary" className="text-sm px-3 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                {usage.totalTimeblocks} Timeblock
                {usage.totalTimeblocks !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-6">
              {/* Questions */}
              {hasQuestions && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Questions using this tag</span>
                  </div>
                  <div className="space-y-2">
                    {usage.questions.map((question) => (
                      <div
                        key={question._id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-relaxed">
                            {question.title}
                          </p>
                        </div>
                      </div>
                    ))}
                    {usage.totalQuestions > 5 && (
                      <p className="text-sm text-muted-foreground pl-7">
                        ...and {usage.totalQuestions - 5} more question
                        {usage.totalQuestions - 5 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timeblocks */}
              {hasTimeblocks && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Timeblocks using this tag</span>
                  </div>
                  <div className="space-y-2">
                    {usage.timeblocks.map((timeblock) => (
                      <div
                        key={timeblock._id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {timeblock.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(timeblock.startTime),
                              "MMM d, yyyy h:mm a",
                            )}{" "}
                            - {format(new Date(timeblock.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {usage.totalTimeblocks > 5 && (
                      <p className="text-sm text-muted-foreground pl-7">
                        ...and {usage.totalTimeblocks - 5} more timeblock
                        {usage.totalTimeblocks - 5 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              To delete this tag, please remove it from all associated questions
              and timeblocks first.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
