"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GoldDividerProps {
  className?: string;
  compact?: boolean;
}

export function GoldDivider({ className, compact = false }: GoldDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn(
        "w-full flex items-center justify-center",
        compact ? "py-4" : "py-10 md:py-14",
        className
      )}
    >
      <svg
        viewBox="0 0 640 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[540px] h-6 text-gold"
      >
        <line
          x1="0"
          y1="12"
          x2="288"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <circle cx="298" cy="12" r="2.2" fill="currentColor" fillOpacity="0.75" />
        <path
          d="M320 4.5L327.5 12L320 19.5L312.5 12L320 4.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="rgba(197,155,39,0.22)"
        />
        <circle cx="342" cy="12" r="2.2" fill="currentColor" fillOpacity="0.75" />
        <line
          x1="352"
          y1="12"
          x2="640"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </svg>
    </div>
  );
}
