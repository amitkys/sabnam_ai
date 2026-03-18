import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2.5 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "prefix">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  prefix,
  postfix,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const hasPrefix = !!prefix;

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && "relative",
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {hasPrefix && (
        <span
          data-icon="inline-start"
          className={cn(
            "inline-flex items-center justify-center",
            isLoading && "invisible",
          )}
        >
          {prefix}
        </span>
      )}

      {children && (
        <span
          className={cn(
            "inline-flex items-center justify-center",
            isLoading && "invisible",
          )}
        >
          {children}
        </span>
      )}

      {postfix && (
        <span
          data-icon="inline-end"
          className={cn(
            "inline-flex items-center justify-center",
            isLoading && "invisible",
          )}
        >
          {postfix}
        </span>
      )}

      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader aria-label="Loading..." />
        </span>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
