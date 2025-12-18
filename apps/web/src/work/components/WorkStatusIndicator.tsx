import { cn } from "@/lib/utils";

type WorkStatus = "working" | "break" | "paused" | "offline";

interface WorkStatusIndicatorProps {
  status: WorkStatus;
  className?: string;
}

export function WorkStatusIndicator({
  status,
  className,
}: WorkStatusIndicatorProps) {
  const colors = {
    working: "bg-green-500",
    break: "bg-blue-500",
    paused: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  const labels = {
    working: "Working",
    break: "On Break",
    paused: "Paused",
    offline: "Offline",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2 w-2 rounded-full", colors[status])} />
      <span className="text-sm text-muted-foreground">{labels[status]}</span>
    </div>
  );
}
