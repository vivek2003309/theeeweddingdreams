"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Search,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useMotionContext } from "@/components/motion/MotionProvider";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import type { CitySlug, PublicHeroSlide } from "@/lib/data/types";
import {
  canUpgradeTo4K,
  computeProgressRatio,
  getNextChapterIndex,
  getPrevChapterIndex,
} from "@/lib/hero/carousel";

interface HeroProcessionalWindowProps {
  slides: PublicHeroSlide[];
}

export function HeroProcessionalWindow({ slides }: HeroProcessionalWindowProps) {
  const { reducedMotion } = useMotionContext();
  const { openEnquiry } = useConcierge();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Quick search pill state
  const [searchMode, setSearchMode] = useState<"venue" | "vendor">("venue");
  const [searchCity, setSearchCity] = useState<CitySlug>("udaipur");
  const [searchMonth, setSearchMonth] = useState("November 2026");
  const [searchGuests, setSearchGuests] = useState<
    "under-100" | "100-250" | "250-500" | "500-plus"
  >("250-500");

  // Ambient Web Audio harmonic (muted by default, 1.2s fade in when toggled ON)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const elapsedMsRef = useRef(0);

  const activeSlide = slides[activeIndex] ?? slides[0];
  const isEffectivelyPlaying = isPlaying && !reducedMotion;

  // Check network/viewport capability for 2160p upgrade hint without cascading setState
  const capable4K = React.useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () => {
      const nav = navigator as Navigator & {
        connection?: { downlink?: number; saveData?: boolean };
      };
      return canUpgradeTo4K({
        viewportWidth: window.innerWidth,
        reducedMotion,
        connection: nav.connection,
      });
    },
    () => false
  );

  const streamResolutionNote = capable4K
    ? "4K Placeholder · 2160p HLS Ready"
    : "4K Placeholder · Adaptive HLS Ready";

  // Chapter timer + progress ring loop
  useEffect(() => {
    if (!isEffectivelyPlaying || slides.length <= 1) return;

    const durationSec = activeSlide?.durationSeconds ?? 8;
    const intervalMs = 80;
    const timer = window.setInterval(() => {
      elapsedMsRef.current += intervalMs;
      const ratio = computeProgressRatio(elapsedMsRef.current, durationSec);
      setProgress(ratio);
      if (ratio >= 1) {
        elapsedMsRef.current = 0;
        setProgress(0);
        setActiveIndex((prev) => getNextChapterIndex(prev, slides.length));
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isEffectivelyPlaying, activeIndex, activeSlide?.durationSeconds, slides.length]);

  const selectChapter = useCallback((idx: number) => {
    elapsedMsRef.current = 0;
    setProgress(0);
    setActiveIndex(idx);
  }, []);

  const handlePrev = () => {
    selectChapter(getPrevChapterIndex(activeIndex, slides.length));
  };

  const handleNext = () => {
    selectChapter(getNextChapterIndex(activeIndex, slides.length));
  };

  // Gentle 1.2s ambient tanpura-inspired harmonic fade-in/out when sound toggled
  const toggleSound = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    try {
      if (!nextMuted) {
        if (!audioCtxRef.current) {
          const AudioCtor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          const ctx = new AudioCtor();
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.connect(ctx.destination);

          // Soft warm fifth chord (Sa-Pa: 196Hz + 293.66Hz)
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(196, ctx.currentTime);
          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(293.66, ctx.currentTime);

          osc1.connect(gain);
          osc2.connect(gain);
          osc1.start();
          osc2.start();

          audioCtxRef.current = ctx;
          gainNodeRef.current = gain;
        }
        if (audioCtxRef.current.state === "suspended") {
          await audioCtxRef.current.resume();
        }
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.cancelScheduledValues(
            audioCtxRef.current.currentTime
          );
          gainNodeRef.current.gain.linearRampToValueAtTime(
            0.035,
            audioCtxRef.current.currentTime + 1.2
          );
        }
      } else if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.cancelScheduledValues(
          audioCtxRef.current.currentTime
        );
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 0.6
        );
      }
    } catch {
      // Audio playback blocked or unavailable in headless browser; UI toggle still updates cleanly
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openEnquiry({
      interestType: searchMode,
      city: searchCity,
      celebrationDate: searchMonth,
      guestCount: searchGuests,
      chapterName: activeSlide?.chapterName,
    });
  };

  if (!activeSlide) return null;

  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);

  return (
    <section
      aria-label="Processional Window Hero Showcase"
      className="relative bg-ivory pt-20 pb-8 md:pt-24 md:pb-12"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Processional Window Inset Frame */}
        <div
          className={cn(
            "relative overflow-hidden border border-hairline shadow-soft bg-blush",
            // Mobile: 4:5 arch-top card; Desktop: cinematic 100svh inset window with arch-curved upper-right corner
            "aspect-[4/5] max-md:rounded-arch md:aspect-auto md:h-[calc(100svh-7.5rem)] md:min-h-[620px] md:max-h-[880px] md:rounded-tl-[24px] md:rounded-bl-[24px] md:rounded-br-[24px] md:rounded-tr-[140px]"
          )}
        >
          {/* 6-Chapter Visual Layers with Smooth Crossfade + Arch Mask Reveal */}
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                data-hls-url={slide.hlsUrl}
                data-preview-mp4={slide.previewMp4Url}
                data-poster-url={slide.posterUrl}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-[1200ms] ease-silk",
                  isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                )}
                style={{ background: slide.visualMotif.backdropGradient }}
              >
                {/* Slow Ken Burns Motion Canvas (pauses when isPlaying=false or reducedMotion) */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    isEffectivelyPlaying && isActive ? "animate-ken-burns" : ""
                  )}
                >
                  {/* Central Chhatri Arch Light Composition */}
                  <div
                    className="relative h-[86%] w-[78%] max-w-[780px] rounded-arch border border-hairline/60 shadow-soft flex flex-col items-center justify-center px-6"
                    style={{ background: slide.visualMotif.archTint }}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 400 460"
                      fill="none"
                      className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-gold/35"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M20 445 V180 C20 88 100 18 200 18 C300 18 380 88 380 180 V445"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <path
                        d="M44 432 V186 C44 104 114 40 200 40 C286 40 356 104 356 186 V432"
                        stroke="currentColor"
                        strokeWidth="0.7"
                        strokeDasharray="4 5"
                      />
                      <circle
                        cx="200"
                        cy="88"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                    </svg>

                    {/* Ambient Glow Accent */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute h-64 w-64 rounded-full blur-3xl"
                      style={{ backgroundColor: slide.visualMotif.accentGlow }}
                    />

                    {/* Placeholder Media Architectural Caption */}
                    <div className="relative z-10 -mt-10 md:-mt-28 text-center">
                      <p className="font-devanagari text-sm md:text-base text-gold-text">
                        {slide.devanagariCaption}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-soft">
                        {slide.venueTitle} · {slide.cityLabel}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-mute">
                        {slide.visualMotif.architecturalLabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accessible text description for screen readers */}
                <span className="sr-only">{slide.altDescription}</span>
              </div>
            );
          })}

          {/* Light Ivory-to-Transparent Scrim — NEVER dark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[64%]"
            style={{
              background:
                "linear-gradient(to top, rgba(255,249,250,0.95) 0%, rgba(255,249,250,0.78) 46%, rgba(255,249,250,0) 100%)",
            }}
          />

          {/* Top-Left Architectural Stream Status & Top-Right Media Controls (safe inset from arch curves) */}
          <div className="relative z-30 flex flex-col items-center gap-3 px-6 pt-12 md:flex-row md:items-center md:justify-between md:px-10 md:pr-28 md:pt-8">
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              <span className="tabular-nums">
                Chapter {activeSlide.chapterIndex} / 0{slides.length}
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-gold">
                ·
              </span>
              <span className="hidden sm:inline text-ink-soft">
                {streamResolutionNote}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous chapter"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next chapter"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-pressed={!isEffectivelyPlaying}
                aria-label={
                  isEffectivelyPlaying
                    ? "Pause hero chapter autoplay"
                    : "Play hero chapter autoplay"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                {isEffectivelyPlaying ? (
                  <Pause className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!isMuted}
                aria-label={
                  isMuted
                    ? "Unmute ambient celebration sound"
                    : "Mute ambient celebration sound"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-glass-strong text-ink transition-colors hover:border-crimson hover:text-crimson cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-4 w-4 text-crimson" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Overlay Content: Headline, 6-Chapter Switcher, Quick Search Bar */}
          <div className="hidden md:flex absolute inset-x-0 bottom-0 z-30 flex-col justify-end px-10 pb-8 lg:px-14 lg:pb-10">
            <div className="max-w-4xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                {activeSlide.settingLabel} · {activeSlide.cityLabel}
              </p>
              <h1
                className="mt-2 font-display font-light text-ink leading-[0.95] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(3rem, 2rem + 3.8vw, 5.25rem)" }}
              >
                {activeSlide.headlinePrefix}{" "}
                <em className="italic font-normal text-crimson-deep">
                  {activeSlide.headlineItalic}
                </em>{" "}
                {activeSlide.headlineSuffix}
              </h1>
              <p className="mt-3 max-w-xl font-sans font-light text-[1.0625rem] leading-[1.6] text-ink-soft">
                {activeSlide.subtitle}
              </p>
            </div>

            {/* 6-Chapter Switcher Row with Progress Ring */}
            <div
              role="tablist"
              aria-label="Wedding celebration chapters"
              className="mt-6 flex flex-wrap items-center gap-2"
            >
              {slides.map((slide, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => selectChapter(idx)}
                    className={cn(
                      "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-[background-color,border-color,color] duration-500 ease-silk whitespace-nowrap shrink-0 cursor-pointer",
                      isSelected
                        ? "border-crimson bg-lotus-soft/60 text-crimson"
                        : "border-hairline bg-glass text-ink-soft hover:border-gold hover:text-ink"
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 28 28"
                      className="h-5 w-5 -rotate-90"
                    >
                      <circle
                        cx="14"
                        cy="14"
                        r={ringRadius}
                        fill="none"
                        stroke="rgba(197,155,39,0.28)"
                        strokeWidth="1.5"
                      />
                      {isSelected && (
                        <circle
                          cx="14"
                          cy="14"
                          r={ringRadius}
                          fill="none"
                          stroke="#E05286"
                          strokeWidth="2"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                    <span className="tabular-nums text-[10px] text-gold-text">
                      {slide.chapterIndex}
                    </span>
                    <span>{slide.chapterName}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Quick Search Pill */}
            <form
              onSubmit={handleQuickSearchSubmit}
              aria-label="Quick celebration search"
              className="mt-5 flex items-center justify-between gap-3 rounded-full border border-hairline bg-glass-strong p-2 pl-4 shadow-soft"
            >
              <div className="flex items-center gap-1 rounded-full border border-hairline-soft bg-ivory p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchMode("venue")}
                  className={cn(
                    "min-h-[36px] rounded-full px-3.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap",
                    searchMode === "venue"
                      ? "bg-lotus-soft text-crimson"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  Venue
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("vendor")}
                  className={cn(
                    "min-h-[36px] rounded-full px-3.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap",
                    searchMode === "vendor"
                      ? "bg-lotus-soft text-crimson"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  Vendor
                </button>
              </div>

              <div className="grid flex-1 grid-cols-3 divide-x divide-hairline-soft">
                <div className="px-4">
                  <label
                    htmlFor="hero-search-city"
                    className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text"
                  >
                    City
                  </label>
                  <select
                    id="hero-search-city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value as CitySlug)}
                    className="w-full bg-transparent text-sm text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="udaipur">Udaipur</option>
                    <option value="jaipur">Jaipur</option>
                    <option value="delhi-ncr">Delhi NCR</option>
                    <option value="goa">Goa</option>
                  </select>
                </div>

                <div className="px-4">
                  <label
                    htmlFor="hero-search-date"
                    className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text"
                  >
                    Date
                  </label>
                  <input
                    id="hero-search-date"
                    type="text"
                    value={searchMonth}
                    onChange={(e) => setSearchMonth(e.target.value)}
                    placeholder="November 2026"
                    className="w-full bg-transparent text-sm text-ink placeholder:text-ink-mute focus:outline-none"
                  />
                </div>

                <div className="px-4">
                  <label
                    htmlFor="hero-search-guests"
                    className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text"
                  >
                    Guests
                  </label>
                  <select
                    id="hero-search-guests"
                    value={searchGuests}
                    onChange={(e) =>
                      setSearchGuests(
                        e.target.value as
                          | "under-100"
                          | "100-250"
                          | "250-500"
                          | "500-plus"
                      )
                    }
                    className="w-full bg-transparent text-sm text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="under-100">Under 100</option>
                    <option value="100-250">100–250 Guests</option>
                    <option value="250-500">250–500 Guests</option>
                    <option value="500-plus">500+ Guests</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary">
                <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
                Plan Celebration
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile (<768px) Below-Frame Editorial Headline, Chapter Row, & Plan Button */}
        <div className="mt-6 space-y-5 md:hidden">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              {activeSlide.settingLabel} · {activeSlide.cityLabel}
            </p>
            <h1 className="mt-2 font-display text-[2.5rem] font-light leading-[1.02] tracking-[-0.02em] text-ink text-balance">
              {activeSlide.headlinePrefix}{" "}
              <em className="italic font-normal text-crimson-deep">
                {activeSlide.headlineItalic}
              </em>{" "}
              {activeSlide.headlineSuffix}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {activeSlide.subtitle}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Wedding chapters"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {slides.map((slide, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => selectChapter(idx)}
                  className={cn(
                    "min-h-[44px] rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] whitespace-nowrap shrink-0",
                    isSelected
                      ? "border-crimson bg-lotus-soft/60 text-crimson"
                      : "border-hairline bg-ivory text-ink-soft"
                  )}
                >
                  {slide.chapterIndex} · {slide.chapterName}
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              openEnquiry({
                city: activeSlide.citySlug,
                chapterName: activeSlide.chapterName,
              })
            }
          >
            Plan Your Celebration
          </Button>
        </div>
      </div>
    </section>
  );
}
