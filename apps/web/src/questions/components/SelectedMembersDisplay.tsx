import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface SelectedMembersDisplayProps {
  users: User[];
  onChangeSelection: () => void;
}

export function SelectedMembersDisplay({
  users,
  onChangeSelection,
}: SelectedMembersDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Asking a question to {users.length} {users.length === 1 ? "person" : "people"}
        </p>
        <Button variant="ghost" size="sm" onClick={onChangeSelection}>
          Change selection
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((user) => {
          const initials = user.name
            .split(" ")
            .map((n) => n.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={user.id}
              className="bg-muted/30 rounded-lg p-3 flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-0.5">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <p className="truncate">{user.email}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
