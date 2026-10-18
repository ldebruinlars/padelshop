"use client";

import { useEffect, useRef } from "react";
import { BRAND_LIST } from "@/lib/catalog";

/**
 * Doorlopende merkenband (van links naar rechts). Elk merk linkt naar de merkpagina; de band stopt bij hover,
 * buiten beeld en bij reduced motion.
 */
export function BrandScroller() {
  const root = useRef<HTMLElement>(null);
  const row = [...BRAND_LIST, ...BRAND_LIST];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-offscreen", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} aria-label="Onze merken" className="marquee overflow-hidden border-y border-panel-2 bg-bg py-8">
      <div className="[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-14 pr-14">
          {row.map((b, i) => {
            const copy = i >= BRAND_LIST.length;
            return (
              <li key={i} aria-hidden={copy || undefined} className="flex items-center gap-14">
                <a
                  href={`/merken/${b.slug}/`}
                  tabIndex={copy ? -1 : undefined}
                  className="font-display text-[clamp(34px,4.4vw,64px)] leading-none font-bold tracking-tight whitespace-nowrap text-fg/45 transition-colors [font-stretch:85%] hover:text-fg focus-visible:text-fg"
                >
                  {b.name}
                </a>
                <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
