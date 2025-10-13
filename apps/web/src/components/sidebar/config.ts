import {
  BookOpen,
  Calendar1,
  MessageCircleQuestionMark,
  SquareTerminal,
  TagIcon,
} from "lucide-react";

export type SidebarItem = {
  title: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: SquareTerminal,
  },
  {
    title: "Schedule",
    path: "/schedule",
    icon: Calendar1,
  },
  {
    title: "Tags",
    path: "/tags",
    icon: TagIcon,
  },
  {
    title: "Questions",
    path: "/questions",
    icon: MessageCircleQuestionMark,
  },
  {
    title: "Knowledge base",
    path: "/knowledge-base",
    icon: BookOpen,
  },
];
