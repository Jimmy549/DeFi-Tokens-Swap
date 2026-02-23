"use client";

import { X } from "lucide-react";
import { clsx } from "clsx";
import type { Notification as NotifType } from "@/types";

interface NotificationProps {
  notifications: NotifType[];
  onDismiss: (id: number) => void;
}

export function NotificationStack({ notifications, onDismiss }: NotificationProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={clsx(
            "flex items-start gap-3 p-4 border-l-4 bg-card border-t border-r border-b border-border",
            "animate-slide-up font-mono text-[0.75rem]",
            {
              "border-l-emerald-500": n.type === "success",
              "border-l-red-500": n.type === "error",
              "border-l-amber-400": n.type === "warn",
              "border-l-[#00d9ff]": n.type === "info",
            }
          )}
        >
          <span
            className={clsx("flex-1 leading-relaxed", {
              "text-emerald-400": n.type === "success",
              "text-red-400": n.type === "error",
              "text-amber-400": n.type === "warn",
              "text-[#00d9ff]": n.type === "info",
            })}
          >
            {n.message}
          </span>
          <button
            onClick={() => onDismiss(n.id)}
            className="text-gray-600 hover:text-gray-300 transition-colors mt-0.5 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
