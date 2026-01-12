import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface SelectedMemberCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  onChangeSelection: () => void;
}

export function SelectedMemberCard({
  user,
  onChangeSelection,
}: SelectedMemberCardProps): React.ReactNode {
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Asking a question to</p>
        <Button variant="ghost" size="sm" onClick={onChangeSelection}>
          Select someone else
        </Button>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base mb-0.5">{user.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <p className="truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
