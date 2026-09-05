import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md bg-surface-2 px-4 text-sm text-fg shadow-[var(--shadow-input)] outline-none transition-[box-shadow] duration-150 placeholder:text-muted",
          "focus-visible:shadow-[var(--shadow-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "font-mono",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
