"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { LotusBullet } from "@/components/ui/Ornaments";
import { useConcierge } from "@/components/concierge/ConciergeContext";
import { useMotionContext } from "@/components/motion/MotionProvider";
import type { PublicProcessionStep } from "@/lib/data/types";

interface ProcessionTimelineProps {
  steps: PublicProcessionStep[];
}

// 5 coordinates along the graceful ceremonial procession curve (viewBox 0 0 1000 180)
const NODE_POINTS = [
  { x: 90, y: 112 },
  { x: 295, y: 66 },
  { x: 500, y: 114 },
  { x: 705, y: 66 },
  { x: 910, y: 108 },
] as const;

const PATH_D =
  "M 90 112 C 180 112, 215 66, 295 66 C 375 66, 420 114, 500 114 C 580 114, 625 66, 705 66 C 785 66, 835 108, 910 108";

export function ProcessionTimeline({ steps }: ProcessionTimelineProps) {
  const { openEnquiry } = useConcierge();
  const { reducedMotion } = useMotionContext();
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const progressPathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const pathEl = progressPathRef.current;
    if (!pathEl) return;

    const totalLen = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${totalLen}`;

    if (reducedMotion || !sectionRef.current) {
      const ratio = steps.length > 1 ? activeIndex / (steps.length - 1) : 1;
      pathEl.style.strokeDashoffset = `${totalLen * (1 - ratio)}`;
      return;
    }

    let isDisposed = false;
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    async function bindScrollProgress() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (isDisposed || !sectionRef.current || !progressPathRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 65%",
          end: "bottom 55%",
          scrub: 0.6,
          onUpdate: (self) => {
            if (!progressPathRef.current) return;
            const len = progressPathRef.current.getTotalLength();
            progressPathRef.current.style.strokeDashoffset = `${
              len * (1 - self.progress)
            }`;
            const idx = Math.min(
              steps.length - 1,
              Math.floor(self.progress * steps.length)
            );
            setActiveIndex(idx);
          },
        });
      }, sectionRef);
    }

    bindScrollProgress();

    return () => {
      isDisposed = true;
      ctx?.revert();
    };
  }, [reducedMotion, steps.length, activeIndex]);

  const activeStep = steps[activeIndex] ?? steps[0];
  const activePoint = NODE_POINTS[activeIndex] ?? NODE_POINTS[0];

  const handleSelectStep = (idx: number) => {
    setActiveIndex(idx);
    const pathEl = progressPathRef.current;
    if (pathEl && steps.length > 1) {
      const totalLen = pathEl.getTotalLength();
      const ratio = idx / (steps.length - 1);
      pathEl.style.strokeDashoffset = `${totalLen * (1 - ratio)}`;
    }
  };

  if (!activeStep) return null;

  return (
    <section
      ref={sectionRef}
      id="procession-timeline"
      aria-label="How It Works — The Procession"
      className="bg-silk py-20 md:py-28 border-t border-hairline-soft"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
              How It Works · The Procession
            </p>
            <h2
              className="mt-2 font-display font-normal text-ink leading-[1.05] text-balance"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              One quiet conversation from{" "}
              <em className="italic text-crimson-deep">shortlist</em> to vows.
            </h2>
            <p className="mt-3 max-w-[62ch] font-sans font-light text-base leading-[1.7] text-ink-soft">
              Our concierge leads the procession so couples and families never
              chase twenty disconnected vendors.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => openEnquiry({ interestType: "complete-wedding" })}
            className="self-start md:self-end"
          >
            Begin Your Story
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>

        <GoldDivider />

        {/* Desktop Interactive SVG Procession Path + Elephant Marker + 5 Lotus Nodes */}
        <div className="hidden lg:block">
          <div className="relative rounded-[24px] border border-hairline-soft bg-ivory/85 px-8 pt-10 pb-8 shadow-soft">
            <svg
              viewBox="0 0 1000 180"
              className="w-full h-[180px] overflow-visible"
              aria-hidden="true"
            >
              {/* Subtle dashed base path */}
              <path
                d={PATH_D}
                fill="none"
                stroke="rgba(197,155,39,0.28)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              {/* Animated gold & lotus progress path */}
              <path
                ref={progressPathRef}
                d={PATH_D}
                fill="none"
                stroke="#C59B27"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-700 ease-silk"
              />

              {/* Ceremonial Ivory & Gold Elephant Marker gliding to active node */}
              <g
                style={{
                  transform: `translate(${activePoint.x}px, ${
                    activePoint.y - 36
                  }px)`,
                  transition: reducedMotion
                    ? "transform 300ms ease"
                    : "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="#FFF9FA"
                  stroke="#C59B27"
                  strokeWidth="1.2"
                />
                {/* Minimal ceremonial Gaja + Chhatri emblem */}
                <path
                  d="M-8 6 C-8 -1 -3 -5 4 -4 C9 -3 11 1 11 5 C11 7 9 8 8 6 M-5 6 L-5 10 M2 6 L2 10"
                  fill="none"
                  stroke="#9E192D"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M-6 -8 Q0 -14 6 -8 Z"
                  fill="#9E192D"
                  stroke="#C59B27"
                  strokeWidth="0.9"
                />
              </g>
            </svg>

            {/* 5 Interactive Lotus Node Step Tabs */}
            <div
              role="tablist"
              aria-label="Five steps of The Procession"
              className="mt-2 grid grid-cols-5 gap-4"
            >
              {steps.map((step, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectStep(idx)}
                    className={cn(
                      "group flex flex-col items-start rounded-2xl border p-4 text-left transition-colors duration-500 ease-silk cursor-pointer",
                      isSelected
                        ? "border-crimson bg-blush/65"
                        : "border-hairline-soft bg-ivory hover:border-hairline hover:bg-blush/30"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-display text-2xl font-light text-gold-antique tabular-nums">
                        {step.stepNumber}
                      </span>
                      <LotusBullet active={isSelected} />
                    </div>
                    <span
                      className={cn(
                        "mt-2 font-display text-xl font-medium transition-colors",
                        isSelected
                          ? "text-crimson"
                          : "text-ink group-hover:text-crimson"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="mt-1 font-devanagari text-xs text-gold-text">
                      {step.devanagariCaption}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Editorial Detail Panel */}
            <div
              role="tabpanel"
              aria-live="polite"
              className="mt-8 grid grid-cols-12 gap-8 items-center rounded-[20px] border border-hairline-soft bg-silk/70 p-8"
            >
              <div className="col-span-3 border-r border-hairline-soft pr-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text">
                  Stage {activeStep.stepNumber} of 0{steps.length}
                </p>
                <p className="mt-1 font-display text-5xl font-light text-gold-antique tabular-nums">
                  {activeStep.stepNumber}
                </p>
                <p className="mt-2 font-devanagari text-sm text-crimson-deep">
                  {activeStep.devanagariCaption}
                </p>
              </div>
              <div className="col-span-6 space-y-2.5">
                <h3 className="font-display text-3xl font-normal text-ink">
                  {activeStep.title}
                </h3>
                <p className="text-base leading-relaxed text-ink-soft">
                  {activeStep.summary}
                </p>
                <p className="text-sm italic text-crimson-deep">
                  “{activeStep.conciergePromise}”
                </p>
              </div>
              <div className="col-span-3 flex flex-col items-start gap-3 border-l border-hairline-soft pl-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-text">
                  Concierge Deliverable
                </span>
                <span className="font-display text-xl text-ink">
                  {activeStep.deliverableLabel}
                </span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    openEnquiry({
                      interestType: "complete-wedding",
                      listingTitle: `Stage ${activeStep.stepNumber}: ${activeStep.title}`,
                    })
                  }
                >
                  Start Here
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <ol className="relative space-y-6 border-l border-hairline pl-6 lg:hidden">
          {steps.map((step, idx) => (
            <li key={step.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[33px] top-4 flex h-4 w-4 items-center justify-center rounded-full bg-ivory border border-hairline"
              >
                <LotusBullet active={idx === activeIndex} />
              </span>
              <div className="rounded-[20px] border border-hairline-soft bg-ivory/90 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-light text-gold-antique tabular-nums">
                    {step.stepNumber}
                  </span>
                  <span className="font-devanagari text-xs text-gold-text">
                    {step.devanagariCaption}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-2xl font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.summary}
                </p>
                <p className="mt-2 text-xs italic text-crimson-deep">
                  {step.conciergePromise}
                </p>
                <p className="mt-3 border-t border-hairline-soft pt-2.5 text-[11px] uppercase tracking-[0.16em] text-gold-text">
                  Deliverable · {step.deliverableLabel}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
