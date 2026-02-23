"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "font-mono font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
          {
            // Primary
            "bg-[#00d9ff] text-[#07090f] hover:bg-[#00c4e8] hover:shadow-glow active:scale-[0.98]":
              variant === "primary",
            // Secondary
            "bg-transparent border border-violet-500 text-violet-400 hover:bg-violet-dim active:scale-[0.98]":
              variant === "secondary",
            // Danger
            "bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10 active:scale-[0.98]":
              variant === "danger",
            // Ghost
            "bg-transparent border border-border text-gray-400 hover:border-[#00d9ff] hover:text-[#00d9ff]":
              variant === "ghost",
          },
          {
            "px-3 py-2 text-[0.65rem]": size === "sm",
            "px-5 py-3 text-[0.75rem]": size === "md",
            "w-full px-6 py-4 text-[0.8rem]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
