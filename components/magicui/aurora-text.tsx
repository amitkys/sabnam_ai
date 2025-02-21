"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";
import React from "react";

interface AuroraTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export function AuroraText({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  as: Component = "span",
  className,
  ...props
}: AuroraTextProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-purple-400 to-pink-500 animate-text",
        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  );
}
