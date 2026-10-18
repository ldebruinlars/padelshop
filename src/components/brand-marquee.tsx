import { BRANDS } from "@/lib/site";

const BADGES = ["Getest bij Poort Padel", "Advies van onze coaches", "Officieel dealer", "Testkosten terug bij aankoop"];

/** Merkenband (stopt bij hover) met de vertrouwensbadges eronder. */
export function BrandMarquee() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section id="merken" className="relative border-y border-white/5 bg-navy py-10">
      <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track flex w-max gap-16 pr-16">
          {row.map((b, i) => (
            <span key={i} className="text-[clamp(32px,4.5vw,64px)] font-semibold tracking-[-0.04em] whitespace-nowrap text-white/25 transition-colors hover:text-white">
              {b}
            </span>
          ))}
        </div>
      </div>
      <ul className="mx-auto mt-8 flex max-w-[1400px] flex-wrap justify-center gap-2 px-5">
        {BADGES.map((b) => (
          <li key={b} className="flex items-center gap-2 rounded-full border border-navy-3 px-4 py-2 font-ui text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
            <span className="size-1.5 rounded-full bg-lime" />
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
