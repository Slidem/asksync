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
}: MemberListItemProps): React.ReactNode {
  const initials =
    displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="group flex items-center justify-between p-3 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-9 w-9 ring-2 ring-muted">
          <AvatarImage src={imageUrl} alt={displayName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{identifier}</p>
        </div>
      </div>
      <Button
        variant={actionType === "remove" ? "ghost" : "secondary"}
        size="sm"
        className={`h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
          actionType === "remove"
            ? "hover:bg-destructive/10 hover:text-destructive"
            : ""
        }`}
        onClick={() => onAction(userId)}
      >
        {actionType === "remove" ? (
          <>
            <X className="h-3.5 w-3.5" />
            <span className="text-xs">Remove</span>
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5" />
            <span className="text-xs">Add</span>
          </>
        )}
      </Button>
    </div>
  );
}
