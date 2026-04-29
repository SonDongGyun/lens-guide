"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark shadow-[0_8px_24px_rgba(49,130,246,0.35)]",
  secondary:
    "bg-bg-muted text-ink-900 hover:bg-ink-50",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-50",
  dark:
    "bg-ink-900 text-white hover:bg-ink-700 shadow-[0_8px_24px_rgba(25,31,40,0.25)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-10 px-5 text-sm rounded-xl",
  md: "h-12 px-6 text-base rounded-2xl",
  lg: "h-14 px-8 text-lg rounded-2xl",
  xl: "h-16 px-10 text-xl rounded-3xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, fullWidth, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
