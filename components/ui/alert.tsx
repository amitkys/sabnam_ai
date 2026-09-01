import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        normal: "bg-card text-card-foreground border-border",
        // Green / Success (Solid background)
        green:
          "bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-sm *:data-[slot=alert-description]:text-emerald-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
        success:
          "bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-sm *:data-[slot=alert-description]:text-emerald-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
        // Yellow / Amber / Warning (Solid background)
        yellow:
          "bg-amber-400 dark:bg-amber-500 text-amber-950 border-amber-500 dark:border-amber-400 shadow-sm *:data-[slot=alert-description]:text-amber-950/90 *:[svg]:text-amber-950 *:data-[slot=alert-title]:text-amber-950 *:data-[slot=alert-title]:font-bold",
        warning:
          "bg-amber-400 dark:bg-amber-500 text-amber-950 border-amber-500 dark:border-amber-400 shadow-sm *:data-[slot=alert-description]:text-amber-950/90 *:[svg]:text-amber-950 *:data-[slot=alert-title]:text-amber-950 *:data-[slot=alert-title]:font-bold",
        // Blue / Info (Solid background)
        blue: "bg-blue-600 dark:bg-blue-600 text-white border-blue-700 dark:border-blue-500 shadow-sm *:data-[slot=alert-description]:text-blue-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
        info: "bg-blue-600 dark:bg-blue-600 text-white border-blue-700 dark:border-blue-500 shadow-sm *:data-[slot=alert-description]:text-blue-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
        // Red / Destructive (Solid background)
        red: "bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-sm *:data-[slot=alert-description]:text-rose-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
        destructive:
          "bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-sm *:data-[slot=alert-description]:text-rose-50 *:[svg]:text-white *:data-[slot=alert-title]:text-white *:data-[slot=alert-title]:font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute top-2.5 right-3", className)}
      data-slot="alert-action"
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
