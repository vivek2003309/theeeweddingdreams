"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Maximize2 } from "lucide-react";
import { ArchImage } from "@/components/ui/ArchImage";
import { CornerBrackets } from "@/components/ui/Ornaments";
import type { PublicGalleryItem } from "@/lib/data/details";

// Dynamic import Lightbox per AGENTS.md rule #14
const DynamicLightbox = dynamic(
  () => import("./Lightbox").then((mod) => mod.Lightbox),
  { ssr: false }
);

interface MediaGalleryProps {
  items: PublicGalleryItem[];
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="columns-1 gap-6 sm:columns-2 space-y-6">
        {items.map((item, idx) => (
          <figure
            key={item.id}
            className="break-inside-avoid group relative rounded-[20px] border border-hairline-soft bg-glass p-4 shadow-soft transition-[transform,box-shadow] duration-700 ease-silk hover:-translate-y-1.5 hover:shadow-lift"
          >
            <CornerBrackets />
            <button
              type="button"
              onClick={() => setOpenIndex(idx)}
              aria-label={`Open lightbox for ${item.title}`}
              className="relative block w-full text-left cursor-pointer"
            >
              <ArchImage
                src={item.posterUrl}
                alt={item.altText}
                ratio={item.aspect}
                archMask={item.archMask}
                gradient={item.gradient}
                caption={`4K Plate ${String(idx + 1).padStart(2, "0")}`}
              />
              <span
                aria-hidden="true"
                className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink-soft transition-colors group-hover:border-crimson group-hover:text-crimson"
              >
                <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </button>
            <figcaption className="mt-3.5">
              <p className="font-display text-xl text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {openIndex !== null && (
        <DynamicLightbox
          items={items}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
