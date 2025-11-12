import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: "admin" | "member";
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const isAdmin = role === "admin";

  return (
    <Badge
      variant={isAdmin ? "default" : "secondary"}
      className={size === "sm" ? "text-xs" : "text-sm"}
    >
      {isAdmin ? "Admin" : "Member"}
    </Badge>
  );
}
