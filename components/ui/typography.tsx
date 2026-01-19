import React, { JSX } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl",
      h2: "scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl lg:text-4xl",
      h3: "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl",
      h4: "scroll-m-20 text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl",
      h5: "scroll-m-20 text-base font-semibold tracking-tight sm:text-lg",
      h6: "scroll-m-20 text-sm font-semibold tracking-tight sm:text-base",
      p: "leading-7 text-base [&:not(:first-child)]:mt-6",
      lead: "text-lg leading-relaxed text-muted-foreground sm:text-xl",
      large: "text-lg font-semibold sm:text-xl",
      small: "text-sm leading-snug font-medium",
      muted: "text-sm text-muted-foreground leading-relaxed",
      blockquote: "mt-6 border-l-2 border-border pl-4 italic text-base sm:pl-6",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold sm:text-sm",
      list: "my-6 ml-4 list-disc space-y-2 text-base sm:ml-6 [&>li]:leading-7",
      inline: "font-mono text-sm bg-muted px-1 py-0.5 rounded",
      link: "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
    },
    affects: {
      default: "",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
      warning: "text-yellow-600 dark:text-yellow-500",
      success: "text-green-600 dark:text-green-500",
      removePMargin: "[&:not(:first-child)]:mt-0",
    },
  },
  defaultVariants: {
    variant: "p",
    affects: "default",
  },
});

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "blockquote"
  | "code"
  | "list"
  | "inline"
  | "link";

type TypographyAffects = "default" | "muted" | "destructive" | "warning" | "success" | "removePMargin";

const variantToTag: Record<TypographyVariant, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  blockquote: "blockquote",
  code: "code",
  list: "ul",
  inline: "code",
  link: "a",
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  affects?: TypographyAffects;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  asChild?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = "p",
      affects = "default",
      children,
      className,
      as,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild
      ? Slot
      : (as ?? variantToTag[variant] ?? "div");

    return React.createElement(
      Comp as any,
      {
        className: cn(typographyVariants({ variant, affects }), className),
        ref,
        ...props,
      },
      children,
    );
  },
);

Typography.displayName = "Typography";

const Text = Typography;

export { Typography, Text, typographyVariants };
export type { TypographyProps };


// if you ever want to override

{/* <Text variant="h1" as="h2">Big Subtitle</Text> // <h2> but LOOKS like h1 */ }