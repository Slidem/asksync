import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MemberListItemProps {
  userId: string;
  imageUrl: string;
  displayName: string;
  identifier: string;
  actionType: "remove" | "add";
  onAction: (userId: string) => void;
}

export function MemberListItem({
  userId,
  imageUrl,
  displayName,
  identifier,
  actionType,
  onAction,
}: MemberListItemProps) {
  const initials =
    displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={imageUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{identifier}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onAction(userId)}
      >
        {actionType === "remove" ? (
          <X className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
