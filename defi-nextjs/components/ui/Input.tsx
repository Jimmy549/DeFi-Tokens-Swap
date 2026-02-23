"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TokenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  badge: string;
  badgeColor?: "accent" | "violet";
  balance?: number;
  onMax?: () => void;
  label?: string;
}

export const TokenInput = forwardRef<HTMLInputElement, TokenInputProps>(
  ({ badge, badgeColor = "accent", balance, onMax, label, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || balance !== undefined) && (
          <div className="flex justify-between items-center">
            <span className="font-mono text-[0.65rem] tracking-widest text-gray-500 uppercase">
              {label}
            </span>
            {balance !== undefined && (
              <button
                type="button"
                onClick={onMax}
                className="font-mono text-[0.65rem] text-emerald-400 hover:text-emerald-300 tracking-wide transition-colors"
              >
                BAL: {balance.toFixed(4)}
              </button>
            )}
          </div>
        )}
        <div
          className={clsx(
            "flex border border-border bg-surface transition-all duration-200",
            "focus-within:border-[#00d9ff] focus-within:shadow-glow-sm"
          )}
        >
          <input
            ref={ref}
            type="number"
            min="0"
            className={clsx(
              "flex-1 bg-transparent outline-none px-4 py-3.5",
              "font-mono text-base text-white placeholder-gray-600",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              className
            )}
            {...props}
          />
          <div
            className={clsx(
              "flex items-center px-4 border-l border-border",
              "font-mono text-[0.75rem] font-bold tracking-widest whitespace-nowrap",
              badgeColor === "accent" ? "text-[#00d9ff]" : "text-violet-400"
            )}
          >
            {badge}
          </div>
        </div>
      </div>
    );
  }
);

TokenInput.displayName = "TokenInput";

interface AddressInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valid?: boolean;
}

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  ({ label, valid, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block font-mono text-[0.62rem] tracking-[2px] text-gray-500 uppercase">
          {label}
        </label>
        <input
          ref={ref}
          className={clsx(
            "w-full bg-surface border px-3.5 py-2.5",
            "font-mono text-[0.72rem] text-white placeholder-gray-600 outline-none",
            "transition-colors duration-200",
            valid === true
              ? "border-emerald-500"
              : valid === false
              ? "border-red-500"
              : "border-border focus:border-[#00d9ff]"
          )}
          spellCheck={false}
          {...props}
        />
      </div>
    );
  }
);

AddressInput.displayName = "AddressInput";
