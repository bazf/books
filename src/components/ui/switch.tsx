// src/components/ui/switch.tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, ...props }, ref) => {
  const { t } = useTranslation();
  const id = React.useId();
  const descriptionId = React.useId();
  
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t(label)}
        </label>
      )}
      <SwitchPrimitives.Root
        id={id}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=unchecked]:bg-zinc-800",
          className
        )}
        {...props}
        ref={ref}
        aria-describedby={description ? descriptionId : undefined}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 dark:bg-zinc-950"
          )}
        />
      </SwitchPrimitives.Root>
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          {t(description)}
        </p>
      )}
    </div>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };