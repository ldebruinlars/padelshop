"use client";

import { useEffect, useRef } from "react";

/**
 * "Panelen die opengaan": een afgerond paneel komt één keer zacht binnen zodra het in beeld scrolt.
 * Geen scroll-scrub meer: het hele paneel meeschalen tijdens het scrollen kostte elk frame een nieuwe tekening.
 */
export function RevealPanel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Pas na het laden "gewapend", zodat het paneel zonder JavaScript gewoon zichtbaar is
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="px-[max(10px,env(safe-area-inset-left))]">
      <div ref={root} id={id} className={`overflow-hidden rounded-[var(--radius-panel)] ${className}`}>
        {children}
      </div>
    </div>
  );
}
