import type { ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

type Variant = "fade-up" | "fade-in" | "slide-left" | "slide-right";

const variantClasses: Record<Variant, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-in": "opacity-0",
  "slide-left": "opacity-0 -translate-x-8",
  "slide-right": "opacity-0 translate-x-8",
};

interface ScrollRevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  className = "",
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all will-change-transform ${
        isVisible ? "translate-x-0 translate-y-0 opacity-100" : variantClasses[variant]
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {children}
    </div>
  );
}
