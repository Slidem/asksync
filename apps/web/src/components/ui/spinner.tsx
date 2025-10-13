import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SpinnerCircle = ({ className, size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-[3px]", 
    lg: "w-10 h-10 border-4"
  };

  return (
    <div 
      className={cn(
        "border-transparent border-t-primary border-r-primary rounded-full animate-spin",
        sizeClasses[size],
        className
      )} 
    />
  );
};

export default SpinnerCircle;
