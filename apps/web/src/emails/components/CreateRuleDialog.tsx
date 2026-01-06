"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "@convex/dataModel";
import { useCreateRule } from "@/emails/hooks/mutations";

interface Connection {
  _id: Id<"gmailConnections">;
  googleEmail: string;
}

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: Connection[];
}

export function CreateRuleDialog({
  open,
  onOpenChange,
  connections,
}: CreateRuleDialogProps) {
  const [name, setName] = useState("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [senderPattern, setSenderPattern] = useState("");
  const [subjectPattern, setSubjectPattern] = useState("");
  const [contentPattern, setContentPattern] = useState("");

  const { createRule, isCreating } = useCreateRule();

  const hasPattern = senderPattern || subjectPattern || contentPattern;
  const isValid = name.trim() && connectionId && hasPattern;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await createRule({
        connectionId: connectionId as Id<"gmailConnections">,
        name: name.trim(),
        senderPattern: senderPattern.trim() || undefined,
        subjectPattern: subjectPattern.trim() || undefined,
        contentPattern: contentPattern.trim() || undefined,
        autoTagIds: [],
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setName("");
    setConnectionId("");
    setSenderPattern("");
    setSubjectPattern("");
    setContentPattern("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Conversion Rule</DialogTitle>
            <DialogDescription>
              Define patterns to match emails and convert them to attention
              items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Important client emails"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection">Gmail Account</Label>
              <Select value={connectionId} onValueChange={setConnectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem key={conn._id} value={conn._id}>
                      {conn.googleEmail}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">
                Match Patterns{" "}
                <span className="font-normal text-muted-foreground">
                  (at least one required)
                </span>
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="sender" className="text-sm">
                    Sender Pattern
                  </Label>
                  <Input
                    id="sender"
                    placeholder="e.g., @client.com or boss@company.com"
                    value={senderPattern}
                    onChange={(e) => setSenderPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Regex pattern to match sender email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm">
                    Subject Pattern
                  </Label>
                  <Input
                    id="subject"
                    placeholder="e.g., URGENT|ACTION REQUIRED"
                    value={subjectPattern}
                    onChange={(e) => setSubjectPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Regex pattern to match email subject
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm">
                    Content Pattern
                  </Label>
                  <Input
                    id="content"
                    placeholder="e.g., please review|need your input"
                    value={contentPattern}
                    onChange={(e) => setContentPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Regex pattern to match email body
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isCreating}>
              {isCreating ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
