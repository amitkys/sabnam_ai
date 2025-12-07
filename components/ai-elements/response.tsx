"use client";

import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

type ResponseProps = React.ComponentProps<typeof Streamdown>;

export function Response({ className, ...props }: ResponseProps) {
  return (
    <div className={cn("size-full prose max-w-none dark:prose-invert", className)}>
      <Streamdown
        {...props}
        className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        remarkPlugins={[
          [remarkGfm, {}],
          [remarkMath, { singleDollarTextMath: true }] // Enable $...$ for inline math
        ]}
      />
    </div>
  );
}
