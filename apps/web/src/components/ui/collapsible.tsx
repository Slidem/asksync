"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible: React.FC<
  React.ComponentProps<typeof CollapsiblePrimitive.Root>
> = ({ ...props }) => {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
};

const CollapsibleTrigger: React.FC<
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>
> = ({ ...props }) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
};

const CollapsibleContent: React.FC<
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>
> = ({ ...props }) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
