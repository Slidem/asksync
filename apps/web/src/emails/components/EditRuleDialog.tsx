"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Id } from "@convex/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUpdateRule } from "@/emails/hooks/mutations";

interface EditRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: {
    _id: Id<"emailConversionRules">;
    name: string;
    senderPattern?: string;
    subjectPattern?: string;
    contentPattern?: string;
  };
}

export function EditRuleDialog({
  open,
  onOpenChange,
  rule,
}: EditRuleDialogProps) {
  const [name, setName] = useState(rule.name);
  const [senderPattern, setSenderPattern] = useState(rule.senderPattern || "");
  const [subjectPattern, setSubjectPattern] = useState(
    rule.subjectPattern || "",
  );
  const [contentPattern, setContentPattern] = useState(
    rule.contentPattern || "",
  );

  const { updateRule, isUpdating } = useUpdateRule();

  const hasPattern = senderPattern || subjectPattern || contentPattern;
  const isValid = name.trim() && hasPattern;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await updateRule({
        ruleId: rule._id,
        name: name.trim(),
        senderPattern: senderPattern.trim() || undefined,
        subjectPattern: subjectPattern.trim() || undefined,
        contentPattern: contentPattern.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled by hook
    }
  };

  // Reset form when rule changes
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setName(rule.name);
      setSenderPattern(rule.senderPattern || "");
      setSubjectPattern(rule.subjectPattern || "");
      setContentPattern(rule.contentPattern || "");
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>Update the conversion rule</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Rule Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                  <Label htmlFor="edit-sender" className="text-sm">
                    Sender Pattern
                  </Label>
                  <Input
                    id="edit-sender"
                    placeholder="e.g., @client.com"
                    value={senderPattern}
                    onChange={(e) => setSenderPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subject" className="text-sm">
                    Subject Pattern
                  </Label>
                  <Input
                    id="edit-subject"
                    placeholder="e.g., URGENT"
                    value={subjectPattern}
                    onChange={(e) => setSubjectPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content" className="text-sm">
                    Content Pattern
                  </Label>
                  <Input
                    id="edit-content"
                    placeholder="e.g., please review"
                    value={contentPattern}
                    onChange={(e) => setContentPattern(e.target.value)}
                    className="font-mono text-sm"
                  />
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
            <Button type="submit" disabled={!isValid || isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
