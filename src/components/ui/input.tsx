// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, required, "aria-label": ariaLabel, "aria-describedby": ariaDescribedby, ...props }, ref) => {
    const { t } = useTranslation();
    const inputId = React.useId();
    const errorId = React.useId();
    
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            error && "border-red-500 dark:border-red-500",
            className
          )}
          ref={ref}
          id={inputId}
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : undefined}
          aria-required={required}
          aria-describedby={cn(
            error ? errorId : undefined,
            ariaDescribedby
          )}
          {...props}
        />
        {error && (
          <p
            className="mt-1 text-sm text-red-500 dark:text-red-400"
            id={errorId}
            role="alert"
          >
            {t(error)}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };