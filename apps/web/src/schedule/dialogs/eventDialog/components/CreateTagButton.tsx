"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface CreateTagButtonProps {
  searchQuery: string;
  onClick: () => void;
}

export const CreateTagButton: React.FC<CreateTagButtonProps> = ({
  searchQuery,
  onClick,
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="w-full justify-start gap-2"
    >
      <Plus className="h-4 w-4" />
      Create tag: {searchQuery}
    </Button>
  );
};

CreateTagButton.displayName = "CreateTagButton";
