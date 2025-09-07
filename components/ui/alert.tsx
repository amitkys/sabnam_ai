import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        secondary:
          "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 [&>svg]:text-slate-600 dark:[&>svg]:text-slate-400",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-accent/50 [&>svg]:text-foreground",
      },
      size: {
        default: "px-4 py-3 text-sm",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-4 text-base",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "sm",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean;
    onDismiss?: () => void;
  }
>(
  (
    {
      className,
      variant,
      size,
      shadow,
      dismissible,
      onDismiss,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(alertVariants({ variant, size, shadow }), className)}
      role="alert"
      {...props}
    >
      {children}
      {dismissible && onDismiss && (
        <button
          aria-label="Dismiss alert"
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          onClick={onDismiss}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      )}
    </div>
  ),
);

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  }
>(({ className, level = 5, children, ...props }, ref) => {
  const Component = `h${level}` as const;

  return (
    <Component
      ref={ref}
      className={cn(
        "mb-1 font-semibold leading-none tracking-tight",
        {
          "text-lg": level <= 3,
          "text-base": level === 4,
          "text-sm": level >= 5,
        },
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed [&_p]:leading-relaxed opacity-90",
      className,
    )}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

// Icon wrapper for consistent styling
const AlertIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0", className)} {...props}>
    {children}
  </div>
));

AlertIcon.displayName = "AlertIcon";

export { Alert, AlertTitle, AlertDescription, AlertIcon };
