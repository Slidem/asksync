import { Circle, Coffee, Laptop, Pause } from "lucide-react";

import { cn } from "@/lib/utils";

export type WorkStatus = "working" | "break" | "paused" | "offline";

interface WorkStatusIndicatorProps {
  status: WorkStatus;
  className?: string;
}

const statusConfig = {
  working: {
    icon: Laptop,
    label: "Working",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
    iconColor: "text-green-600 dark:text-green-400",
    animate: true,
  },
  break: {
    icon: Coffee,
    label: "On Break",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
    animate: false,
  },
  paused: {
    icon: Pause,
    label: "Paused",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    animate: false,
  },
  offline: {
    icon: Circle,
    label: "Offline",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400",
    iconColor: "text-gray-400 dark:text-gray-500",
    animate: false,
  },
};

export function WorkStatusIndicator({
  status,
  className,
}: WorkStatusIndicatorProps): React.ReactNode {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        config.bgColor,
        config.textColor,
        className,
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          config.iconColor,
          config.animate && "animate-pulse",
        )}
      />
      <span>{config.label}</span>
    </div>
  );
}
