// src/components/ui/label.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required, optional, ...props }, ref) => {
  const { t } = useTranslation();
  
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500 dark:text-red-400" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span 
          className="ml-1 text-zinc-500 dark:text-zinc-400 text-xs"
          aria-label={t('optionalField')}
        >
          ({t('optional')})
        </span>
      )}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };