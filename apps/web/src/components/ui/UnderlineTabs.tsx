import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const UnderlineTabs = TabsPrimitive.Root;

const UnderlineTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center bg-transparent border-b h-auto p-0 rounded-none gap-0",
      className,
    )}
    {...props}
  />
));
UnderlineTabsList.displayName = TabsPrimitive.List.displayName;

interface UnderlineTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  badge?: number;
  icon?: React.ReactNode;
  hasError?: boolean;
}

const UnderlineTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  UnderlineTabsTriggerProps
>(({ className, children, badge, icon, hasError, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-none border-0 border-b-2 border-transparent",
      "py-2 px-3 sm:py-3 sm:px-4 text-sm font-medium ring-offset-background transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground",
      "hover:text-foreground",
      hasError && "text-destructive",
      className,
    )}
    {...props}
  >
    {icon && <span className="sm:mr-2">{icon}</span>}
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-muted text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
        {badge}
      </span>
    )}
  </TabsPrimitive.Trigger>
));
UnderlineTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const UnderlineTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
UnderlineTabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  UnderlineTabs,
  UnderlineTabsList,
  UnderlineTabsTrigger,
  UnderlineTabsContent,
};
