import React from "react";
import { cn } from "@/lib/utils";

interface LotusBulletProps {
  active?: boolean;
  className?: string;
}

export function LotusBullet({ active = false, className }: LotusBulletProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "h-3 w-3 shrink-0 transition-transform duration-500 ease-silk",
        active ? "text-crimson scale-110" : "text-lotus",
        className
      )}
    >
      <path
        d="M8 2C6.2 4.4 5.5 6.8 5.5 9.2C5.5 11.4 6.6 13 8 13.8C9.4 13 10.5 11.4 10.5 9.2C10.5 6.8 9.8 4.4 8 2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.18 : 0}
      />
      <path
        d="M5.6 11.8C3.8 11.2 2.6 9.6 2.5 7.2C4.2 7.6 5.2 8.8 5.6 11.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M10.4 11.8C12.2 11.2 13.4 9.6 13.5 7.2C11.8 7.6 10.8 8.8 10.4 11.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

export function CornerBrackets({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-silk",
        className
      )}
    >
      <span className="absolute top-0 left-0 h-3.5 w-3.5 border-t border-l border-gold" />
      <span className="absolute top-0 right-0 h-3.5 w-3.5 border-t border-r border-gold" />
      <span className="absolute bottom-0 left-0 h-3.5 w-3.5 border-b border-l border-gold" />
      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-gold" />
    </div>
  );
}
