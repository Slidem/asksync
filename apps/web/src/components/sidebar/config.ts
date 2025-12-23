import {
  BarChart3,
  Calendar1,
  MessageCircleQuestionMark,
  Settings,
  SquareTerminal,
  TagIcon,
  Timer,
  Users,
} from "lucide-react";

export type SidebarItem = {
  title: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", path: "/", icon: SquareTerminal },
  { title: "Work Mode", path: "/work", icon: Timer },
  { title: "Schedule", path: "/schedule", icon: Calendar1 },
  { title: "Tags", path: "/tags", icon: TagIcon },
  { title: "Members", path: "/members", icon: Users },
  { title: "Questions", path: "/questions", icon: MessageCircleQuestionMark },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];
