"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { PublicGalleryItem } from "@/lib/data/details";

interface LightboxProps {
  items: PublicGalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);

  const active = items[index] ?? items[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setZoom(1);
        setIndex((i) => (i + 1) % items.length);
      }
      if (e.key === "ArrowLeft") {
        setZoom(1);
        setIndex((i) => (i - 1 + items.length) % items.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length, onClose]);

  if (!active) return null;

  const goPrev = () => {
    setZoom(1);
    setIndex((i) => (i - 1 + items.length) % items.length);
  };

  const goNext = () => {
    setZoom(1);
    setIndex((i) => (i + 1) % items.length);
  };

  const toggleZoom = () => {
    setZoom((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery lightbox: ${active.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-ivory/95 backdrop-blur-[18px] text-ink"
    >
      {/* Light Blush-Ivory Lightbox Chrome Header (NEVER dark) */}
      <div className="flex items-center justify-between border-b border-hairline-soft bg-glass-strong px-5 py-4 md:px-10">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text tabular-nums">
            Plate {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </p>
          <p className="font-display text-xl md:text-2xl text-ink">
            {active.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleZoom}
            aria-label={zoom > 1 ? "Reset zoom" : "Zoom in on plate"}
            className="flex h-11 items-center gap-1.5 rounded-full border border-hairline bg-ivory px-4 text-xs uppercase tracking-[0.14em] text-ink hover:border-crimson hover:text-crimson cursor-pointer"
          >
            {zoom > 1 ? (
              <ZoomOut className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
            )}
            <span className="tabular-nums">{zoom}×</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery lightbox"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-ivory text-ink hover:border-crimson hover:text-crimson cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Main Lightbox Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-6 md:px-16">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous gallery plate"
          className="absolute left-4 md:left-8 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink shadow-soft hover:border-crimson hover:text-crimson cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="relative flex h-full w-full max-w-4xl items-center justify-center overflow-hidden rounded-[24px] border border-hairline bg-blush/50 shadow-lift">
          <div
            role="img"
            aria-label={active.altText}
            className="relative flex h-full w-full flex-col items-center justify-center p-10 text-center transition-transform duration-700 ease-silk"
            style={{
              background: active.gradient,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 360 420"
              fill="none"
              className="pointer-events-none absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)] text-gold/40"
              preserveAspectRatio="none"
            >
              <path
                d="M16 408 V160 C16 78 90 14 180 14 C270 14 344 78 344 160 V408"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M36 394 V166 C36 94 100 34 180 34 C260 34 324 94 324 166 V394"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="4 5"
              />
            </svg>
            <p className="relative z-10 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              4K Editorial Plate · High-Key Daylight
            </p>
            <h3 className="relative z-10 mt-2 font-display text-3xl md:text-5xl font-light text-ink">
              {active.title}
            </h3>
            <p className="relative z-10 mt-3 max-w-md text-sm text-ink-soft">
              {active.caption}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next gallery plate"
          className="absolute right-4 md:right-8 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink shadow-soft hover:border-crimson hover:text-crimson cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom Thumbnail Strip & Caption */}
      <div className="border-t border-hairline-soft bg-blush/50 px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">{active.altText}</p>
          <div className="flex items-center gap-2 overflow-x-auto">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setZoom(1);
                  setIndex(idx);
                }}
                aria-label={`View plate ${idx + 1}: ${item.title}`}
                aria-pressed={idx === index}
                className={`h-10 min-w-[44px] rounded-full border px-3 text-xs tabular-nums transition-colors cursor-pointer ${
                  idx === index
                    ? "border-crimson bg-lotus-soft text-crimson font-medium"
                    : "border-hairline bg-ivory text-ink-soft hover:border-gold"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
