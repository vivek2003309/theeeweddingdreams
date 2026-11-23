"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type Lenis from "lenis";

interface MotionContextValue {
  reducedMotion: boolean;
  scrollY: number;
  scrollDirection: "up" | "down";
  scrollTo: (target: string | number | HTMLElement) => void;
}

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  scrollY: 0,
  scrollDirection: "up",
  scrollTo: () => {},
});

export function useMotionContext() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const lenisRef = useRef<Lenis | null>(null);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mq.matches);
    updatePreference();
    mq.addEventListener("change", updatePreference);
    return () => mq.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    let isDisposed = false;
    let lenisInstance: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;
    let gsapCore: typeof import("gsap").gsap | null = null;
    let gsapCtx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    const updateNativeScroll = () => {
      const current = window.scrollY || 0;
      const prev = lastScrollRef.current;
      if (Math.abs(current - prev) > 2) {
        setScrollDirection(current > prev ? "down" : "up");
        lastScrollRef.current = current;
      }
      setScrollY(current);
    };

    window.addEventListener("scroll", updateNativeScroll, { passive: true });

    if (reducedMotion) {
      return () => {
        window.removeEventListener("scroll", updateNativeScroll);
      };
    }

    async function initMotion() {
      const [{ gsap }, { ScrollTrigger }, { default: LenisCtor }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);

      if (isDisposed) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapCore = gsap;

      lenisInstance = new LenisCtor({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });

      lenisRef.current = lenisInstance;

      lenisInstance.on("scroll", (e: { scroll: number; direction: number }) => {
        ScrollTrigger.update();
        setScrollY(e.scroll);
        if (e.direction === 1) setScrollDirection("down");
        else if (e.direction === -1) setScrollDirection("up");
      });

      gsapCtx = gsap.context(() => {
        tickerCallback = (time: number) => {
          lenisInstance?.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);
      });
    }

    initMotion();

    return () => {
      isDisposed = true;
      window.removeEventListener("scroll", updateNativeScroll);
      if (gsapCore && tickerCallback) {
        gsapCore.ticker.remove(tickerCallback);
      }
      gsapCtx?.revert();
      lenisInstance?.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement) => {
      if (lenisRef.current && !reducedMotion) {
        lenisRef.current.scrollTo(target, { duration: 1.2 });
        return;
      }
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "auto" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "auto" });
      } else {
        target.scrollIntoView({ behavior: "auto" });
      }
    },
    [reducedMotion]
  );

  const value = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      scrollY,
      scrollDirection,
      scrollTo,
    }),
    [reducedMotion, scrollY, scrollDirection, scrollTo]
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}
