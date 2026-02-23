import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, children, glow, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "relative bg-card border border-border overflow-hidden",
        glow && "shadow-glow-sm",
        className
      )}
      {...props}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d9ff]/40 to-transparent" />
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 font-mono text-[0.62rem] tracking-[3px] uppercase text-gray-500 mb-5",
        className
      )}
      {...props}
    >
      {children}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
