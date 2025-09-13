"use client";

import type { VariantProps } from "tailwind-variants";

import * as React from "react";
import { IconLoader } from "justd-icons";
import { ProgressBar } from "react-aria-components";
import { tv } from "tailwind-variants";

import { cn } from "@/lib/utils";

const loaderStyles = tv({
  base: "relative",
  variants: {
    intent: {
      current: "text-current",
      primary: "text-primary",
      secondary: "text-muted-fg",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
    },
    size: {
      micro: "size-2",
      tiny: "size-2.5",
      "extra-small": "size-3",
      xs: "size-3.5",
      small: "size-4",
      sm: "size-5",
      medium: "size-6",
      md: "size-7",
      large: "size-8",
      lg: "size-9",
      "extra-large": "size-10",
      xl: "size-11",
      "2xl": "size-12",
      "3xl": "size-16",
      "4xl": "size-20",
      "5xl": "size-24",
      "6xl": "size-32",
    },
  },
  defaultVariants: {
    intent: "current",
    size: "small",
  },
});

type LoaderVariantProps = VariantProps<typeof loaderStyles>;

const Bars = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("size-4", className)}
    data-slot="icon"
    fill="currentColor"
    viewBox="0 0 135 140"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect height="120" rx="6" width="15" y="10">
      <animate
        attributeName="height"
        begin="0.5s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="120;110;100;90;80;70;60;50;40;140;120"
      />
      <animate
        attributeName="y"
        begin="0.5s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="10;15;20;25;30;35;40;45;50;0;10"
      />
    </rect>
    <rect height="120" rx="6" width="15" x="30" y="10">
      <animate
        attributeName="height"
        begin="0.25s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="120;110;100;90;80;70;60;50;40;140;120"
      />
      <animate
        attributeName="y"
        begin="0.25s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="10;15;20;25;30;35;40;45;50;0;10"
      />
    </rect>
    <rect height="140" rx="6" width="15" x="60">
      <animate
        attributeName="height"
        begin="0s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="120;110;100;90;80;70;60;50;40;140;120"
      />
      <animate
        attributeName="y"
        begin="0s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="10;15;20;25;30;35;40;45;50;0;10"
      />
    </rect>
    <rect height="120" rx="6" width="15" x="90" y="10">
      <animate
        attributeName="height"
        begin="0.25s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="120;110;100;90;80;70;60;50;40;140;120"
      />
      <animate
        attributeName="y"
        begin="0.25s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="10;15;20;25;30;35;40;45;50;0;10"
      />
    </rect>
    <rect height="120" rx="6" width="15" x="120" y="10">
      <animate
        attributeName="height"
        begin="0.5s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="120;110;100;90;80;70;60;50;40;140;120"
      />
      <animate
        attributeName="y"
        begin="0.5s"
        calcMode="linear"
        dur="1s"
        repeatCount="indefinite"
        values="10;15;20;25;30;35;40;45;50;0;10"
      />
    </rect>
  </svg>
);

const Ring = (props: React.SVGProps<SVGSVGElement>) => (
  <IconLoader {...props} />
);

const Spin = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("size-4", className)}
    data-slot="icon"
    viewBox="0 0 2400 2400"
    {...props}
  >
    <g fill="none" strokeLinecap="round" strokeWidth="200">
      <line x1="1200" x2="1200" y1="600" y2="100" />
      <line opacity="0.5" x1="1200" x2="1200" y1="2300" y2="1800" />
      <line opacity="0.917" x1="900" x2="650" y1="680.4" y2="247.4" />
      <line opacity="0.417" x1="1750" x2="1500" y1="2152.6" y2="1719.6" />
      <line opacity="0.833" x1="680.4" x2="247.4" y1="900" y2="650" />
      <line opacity="0.333" x1="2152.6" x2="1719.6" y1="1750" y2="1500" />
      <line opacity="0.75" x1="600" x2="100" y1="1200" y2="1200" />
      <line opacity="0.25" x1="2300" x2="1800" y1="1200" y2="1200" />
      <line opacity="0.667" x1="680.4" x2="247.4" y1="1500" y2="1750" />
      <line opacity="0.167" x1="2152.6" x2="1719.6" y1="650" y2="900" />
      <line opacity="0.583" x1="900" x2="650" y1="1719.6" y2="2152.6" />
      <line opacity="0.083" x1="1750" x2="1500" y1="247.4" y2="680.4" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        begin="0.08333s"
        calcMode="discrete"
        dur="0.83333s"
        keyTimes="0;0.08333;0.16667;0.25;0.33333;0.41667;0.5;0.58333;0.66667;0.75;0.83333;0.91667"
        repeatCount="indefinite"
        type="rotate"
        values="0 1199 1199;30 1199 1199;60 1199 1199;90 1199 1199;120 1199 1199;150 1199 1199;180 1199 1199;210 1199 1199;240 1199 1199;270 1199 1199;300 1199 1199;330 1199 1199"
      />
    </g>
  </svg>
);

const LOADERS = {
  bars: Bars,
  ring: Ring,
  spin: Spin,
};

const DEFAULT_SPINNER = "ring";

interface LoaderProps
  extends Omit<
    React.ComponentPropsWithoutRef<"svg">,
    "display" | "opacity" | "intent"
  >,
  LoaderVariantProps {
  variant?: keyof typeof LOADERS;
  percentage?: number;
  isIndeterminate?: boolean | undefined;
  formatOptions?: Intl.NumberFormatOptions;
}

const Loader = React.forwardRef<SVGSVGElement, LoaderProps>(
  ({ isIndeterminate = true, ...props }, ref) => {
    const {
      className,
      variant = DEFAULT_SPINNER,
      intent,
      size,
      ...spinnerProps
    } = props;
    const LoaderPrimitive = LOADERS[variant in LOADERS ? variant : "ring"];

    return (
      <ProgressBar
        aria-label={props["aria-label"] ?? "Loading..."}
        formatOptions={props.formatOptions}
        isIndeterminate={isIndeterminate}
      >
        <LoaderPrimitive
          ref={ref}
          className={loaderStyles({
            intent,
            size,
            className: cn([
              ["ring"].includes(variant) && "animate-spin",
              variant === "spin" && "stroke-current",
              className,
            ]),
          })}
          role="presentation"
          {...spinnerProps}
        />
      </ProgressBar>
    );
  },
);

Loader.displayName = "Loader";

export { Loader };
