import { BRAND_LIST } from "@/lib/catalog";

const BADGES = ["Getest bij Poort Padel", "Advies van onze coaches", "Tien topmerken", "Testkosten terug bij aankoop"];

/** Merkenband (stopt bij hover) met links naar de merkpagina's en de vertrouwensbadges eronder. */
export function BrandMarquee() {
  const row = [...BRAND_LIST, ...BRAND_LIST];
  return (
    <section id="merken" className="relative border-y border-fg/5 bg-bg py-10">
      <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track flex w-max gap-16 pr-16">
          {row.map((b, i) => (
            <a
              key={i}
              href={`/merken/${b.slug}/`}
              // De tweede set is alleen voor de naadloze loop
              aria-hidden={i >= BRAND_LIST.length || undefined}
              tabIndex={i >= BRAND_LIST.length ? -1 : undefined}
              className="text-[clamp(32px,4.5vw,64px)] font-semibold tracking-[-0.04em] whitespace-nowrap text-fg/40 transition-colors hover:text-fg focus-visible:text-fg"
            >
              {b.name}
            </a>
          ))}
        </div>
      </div>
      <ul className="mx-auto mt-8 flex max-w-[1400px] flex-wrap justify-center gap-2 px-5">
        {BADGES.map((b) => (
          <li key={b} className="flex items-center gap-2 rounded-full border border-panel-2 px-4 py-2 font-ui text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            <span className="size-1.5 rounded-full bg-accent" />
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
