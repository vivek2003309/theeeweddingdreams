import React from "react";
import { cn } from "@/lib/utils";
import type { BudgetTier } from "@/lib/data/types";
import { formatTierDiamonds } from "@/lib/data/filters";

interface TierMarkerProps {
  tier: BudgetTier;
  className?: string;
}

export function TierMarker({ tier, className }: TierMarkerProps) {
  const { diamonds, label } = formatTierDiamonds(tier);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.14em] uppercase whitespace-nowrap",
        className
      )}
      aria-label={`${label} tier`}
    >
      <span className="text-gold-antique text-sm leading-none" aria-hidden="true">
        {diamonds}
      </span>
      <span className="text-gold-text font-medium">{label}</span>
    </span>
  );
}
