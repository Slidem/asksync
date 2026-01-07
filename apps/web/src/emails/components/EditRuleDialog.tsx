"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Id } from "@convex/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateRule } from "@/emails/hooks/mutations";
import { useTags } from "@/tags/hooks/queries";

interface EditRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: {
    _id: Id<"emailConversionRules">;
    name: string;
    senderPattern?: string;
    subjectPattern?: string;
    contentPattern?: string;
    autoTagIds: string[];
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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    rule.autoTagIds || [],
  );

  const { updateRule, isUpdating } = useUpdateRule();
  const { tags } = useTags({});

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const removeTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  };

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
        autoTagIds: selectedTagIds,
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
      setSelectedTagIds(rule.autoTagIds || []);
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

            {/* Auto-add Tags */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">
                Auto-add Tags{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>

              {/* Selected tags */}
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTagIds.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => removeTag(tagId)}
                          className="ml-1 rounded-full hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Tag selection list */}
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">
                    No tags available
                  </p>
                ) : (
                  tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tags will be automatically added to attention items created by
                this rule
              </p>
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
