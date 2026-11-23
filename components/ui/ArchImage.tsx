"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ArchImageProps {
  src: string;
  alt: string;
  ratio?: "4/5" | "3/4" | "4/3" | "16/9";
  gradient?: string;
  caption?: string;
  className?: string;
  priority?: boolean;
  archMask?: boolean;
}

const RATIO_CLASS: Record<NonNullable<ArchImageProps["ratio"]>, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
};

export function ArchImage({
  src,
  alt,
  ratio = "4/5",
  gradient = "linear-gradient(155deg, #FFF9FA 0%, #FDEEF2 55%, #F6DCE4 100%)",
  caption,
  className,
  priority = false,
  archMask = true,
}: ArchImageProps) {
  const isPlaceholder = src.startsWith("/placeholder/");
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-hairline-soft bg-blush select-none",
        archMask ? "rounded-arch" : "rounded-[20px]",
        RATIO_CLASS[ratio],
        className
      )}
    >
      {!isPlaceholder && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-1000 ease-silk group-hover:scale-[1.03]"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="relative flex h-full w-full flex-col items-center justify-end p-5 text-center transition-transform duration-1000 ease-silk group-hover:scale-[1.03]"
          style={{ background: gradient }}
        >
          {/* Architectural inner chhatri arch linework */}
          <svg
            aria-hidden="true"
            viewBox="0 0 240 300"
            fill="none"
            className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-gold/40"
            preserveAspectRatio="none"
          >
            <path
              d="M12 290 V120 C12 58 60 12 120 12 C180 12 228 58 228 120 V290"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M28 282 V124 C28 72 68 30 120 30 C172 30 212 72 212 124 V282"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="3 4"
            />
          </svg>
          <span className="relative z-10 text-[11px] font-sans uppercase tracking-[0.2em] text-gold-text/90">
            {caption ?? "4K Placeholder"}
          </span>
        </div>
      )}
    </div>
  );
}
