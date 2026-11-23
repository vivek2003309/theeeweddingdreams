"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supportsMagneticPointer } from "@/lib/motion/config";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet";
  size?: "md" | "lg";
  href?: string;
  magnetic?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  magnetic = true,
  className,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const enableMagnetic = magnetic && variant === "primary";

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (enableMagnetic && supportsMagneticPointer() && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setOffset({
        x: Math.max(-6, Math.min(6, relX * 5)),
        y: Math.max(-4, Math.min(4, relY * 3.5)),
      });
    }
    if (onMouseMove && !href) {
      onMouseMove(e as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (enableMagnetic) {
      setOffset({ x: 0, y: 0 });
    }
    if (onMouseLeave && !href) {
      onMouseLeave(e as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const baseClasses = cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium uppercase tracking-[0.14em] text-[0.8125rem] leading-none whitespace-nowrap shrink-0 overflow-hidden select-none cursor-pointer",
    "transition-[transform,background-color,color,border-color,box-shadow] duration-500 ease-silk",
    "min-h-[44px]",
    size === "lg" ? "px-8 py-3.5" : "px-6 py-3",
    variant === "primary" &&
      "bg-crimson text-ivory hover:bg-crimson-deep shadow-soft",
    variant === "secondary" &&
      "bg-transparent border border-hairline text-crimson hover:border-crimson",
    variant === "quiet" &&
      "bg-transparent text-ink-soft hover:text-crimson px-3",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className
  );

  const inlineStyle: React.CSSProperties | undefined = enableMagnetic
    ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
    : undefined;

  const content = (
    <>
      {variant === "secondary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-crimson scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-[transform,opacity] duration-500 ease-silk origin-center"
        />
      )}
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2 transition-colors duration-500 ease-silk",
          variant === "secondary" && "group-hover:text-ivory"
        )}
      >
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={baseClasses}
        style={inlineStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={props.type ?? "button"}
      className={baseClasses}
      style={inlineStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {content}
    </button>
  );
}
