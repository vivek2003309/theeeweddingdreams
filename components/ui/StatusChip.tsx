import React from "react";
import { Check, Clock, Info, Search, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerStatus } from "@/lib/data/types";

interface StatusChipProps {
  status: PartnerStatus;
  className?: string;
}

const STATUS_MAP: Record<
  PartnerStatus,
  {
    label: string;
    colorClass: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  pending_verification: {
    label: "Pending Verification",
    colorClass: "text-gold-text border-hairline bg-silk",
    Icon: Clock,
  },
  under_review: {
    label: "Under Review",
    colorClass: "text-ink border-lotus/50 bg-blush",
    Icon: Search,
  },
  approved: {
    label: "Approved",
    colorClass: "text-success border-success/40 bg-ivory",
    Icon: Check,
  },
  rejected: {
    label: "Declined",
    colorClass: "text-crimson border-crimson/40 bg-blush",
    Icon: XCircle,
  },
  needs_info: {
    label: "Needs Info",
    colorClass: "text-ink-soft border-hairline bg-ivory",
    Icon: Info,
  },
};

export function StatusChip({ status, className }: StatusChipProps) {
  const meta = STATUS_MAP[status];
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.06em] whitespace-nowrap",
        meta.colorClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span>{meta.label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-ivory-shimmer rounded-[20px] border border-hairline-soft",
        className
      )}
    />
  );
}
