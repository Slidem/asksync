"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { TAG_COLORS } from "@asksync/shared";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTag } from "@/tags/hooks/mutations";

interface InlineTagCreateFormProps {
  initialName: string;
  onSuccess: (tagId: string) => void;
  onCancel: () => void;
}

export const InlineTagCreateForm: React.FC<InlineTagCreateFormProps> = ({
  initialName,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = React.useState(initialName);
  const [color, setColor] = React.useState<(typeof TAG_COLORS)[number]>(
    TAG_COLORS[0],
  );
  const [description, setDescription] = React.useState("");

  const { createTag, isCreating } = useCreateTag();

  const handleCreate = React.useCallback(async () => {
    if (!name.trim()) return;

    try {
      const tagId = await createTag({
        name: name.trim(),
        color,
        description: description.trim() || undefined,
        answerMode: "scheduled",
      });

      onSuccess(tagId);
    } catch (error) {
      console.warn("Failed to create tag:", error);
      // Error is already handled by useCreateTag hook with toast
      // Keep form open for user to correct
    }
  }, [name, color, description, createTag, onSuccess]);

  const handleNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    [],
  );

  const handleDescriptionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    [],
  );

  const isDisabled = !name.trim() || isCreating;

  return (
    <div className="space-y-3 border rounded-md p-3 bg-muted/50">
      {/* Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="tag-name" className="text-sm font-medium">
          Tag Name
        </Label>
        <Input
          id="tag-name"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter tag name"
          disabled={isCreating}
        />
      </div>

      {/* Color Picker */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === c ? "border-gray-900 scale-110" : "border-gray-300"
              } transition-all`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              disabled={isCreating}
            />
          ))}
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <Label htmlFor="tag-description" className="text-sm font-medium">
          Description (optional)
        </Label>
        <Textarea
          id="tag-description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe when this tag applies"
          rows={2}
          disabled={isCreating}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={isDisabled}
        >
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};

InlineTagCreateForm.displayName = "InlineTagCreateForm";
