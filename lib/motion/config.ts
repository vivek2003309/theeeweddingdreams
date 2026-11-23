export const EASE_SILK_BEZIER = [0.22, 1, 0.36, 1] as const;

export const EASE_SILK_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const GSAP_EASE_SILK = "power3.out";

export const MOTION_DURATIONS = {
  micro: 0.5,
  drawer: 0.7,
  reveal: 0.9,
  heroTransition: 1.2,
  dividerDraw: 1.4,
  ambientMax: 1.6,
  reducedFade: 0.3,
} as const;

export const MOTION_TRAVEL = {
  textPx: 24,
  cardPx: 50,
  parallaxRatio: 0.06,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsMagneticPointer(): boolean {
  if (typeof window === "undefined") return false;
  return (
    !prefersReducedMotion() &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
