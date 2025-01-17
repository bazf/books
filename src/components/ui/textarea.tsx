// src/components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  required?: boolean;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error, 
    required,
    helperText, 
    "aria-label": ariaLabel, 
    "aria-describedby": ariaDescribedby,
    ...props 
  }, ref) => {
    const { t } = useTranslation();
    const textareaId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            error && "border-red-500 dark:border-red-500",
            className
          )}
          ref={ref}
          id={textareaId}
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : undefined}
          aria-required={required}
          aria-describedby={cn(
            error ? errorId : undefined,
            helperText ? helperId : undefined,
            ariaDescribedby
          )}
          {...props}
        />
        {helperText && (
          <p
            className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
            id={helperId}
          >
            {t(helperText)}
          </p>
        )}
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
Textarea.displayName = "Textarea";

export { Textarea };