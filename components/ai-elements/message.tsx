import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full gap-3 py-3",
      from === "user" ? "is-user justify-end" : "is-assistant justify-start",
      className,
    )}
    {...props}
  />
);

const messageContentVariants = cva(
  "flex flex-col gap-2 overflow-hidden rounded-2xl text-sm leading-relaxed",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[75%] px-4 py-3",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
          "group-[.is-assistant]:bg-muted group-[.is-assistant]:text-foreground",
        ],
        flat: [
          "max-w-[80%]",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:px-4 group-[.is-user]:py-3",
          "group-[.is-assistant]:bg-muted group-[.is-assistant]:text-foreground group-[.is-assistant]:px-4 group-[.is-assistant]:py-3",
        ],
        minimal: [
          "max-w-[80%]",
          "group-[.is-user]:bg-primary/10 group-[.is-user]:text-foreground group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:border group-[.is-user]:border-primary/20",
          "group-[.is-assistant]:bg-muted/50 group-[.is-assistant]:text-foreground group-[.is-assistant]:px-4 group-[.is-assistant]:py-3 group-[.is-assistant]:border group-[.is-assistant]:border-border",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  },
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn(
      "size-8 shrink-0 ring-1 ring-border",
      "group-[.is-user]:order-2",
      className,
    )}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
