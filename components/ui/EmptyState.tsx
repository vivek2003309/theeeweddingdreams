import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "Every celebration is bespoke.",
  description = "Let our concierge find it for you — share your dates and preferences and we will curate a private shortlist.",
  actionLabel = "Ask Our Concierge",
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[20px] border border-hairline-soft bg-glass px-6 py-14 text-center shadow-soft",
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 64 48"
        fill="none"
        className="mb-5 h-12 w-16 text-gold"
      >
        <path
          d="M32 6C26 14 23 22 23 30C23 37 27 41 32 43C37 41 41 37 41 30C41 22 38 14 32 6Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="rgba(247,201,216,0.3)"
        />
        <path
          d="M23 36C16 34 11 28 10 20C17 21 21 26 23 36Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M41 36C48 34 53 28 54 20C47 21 43 26 41 36Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <line
          x1="8"
          y1="44"
          x2="56"
          y2="44"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      </svg>
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      {onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
