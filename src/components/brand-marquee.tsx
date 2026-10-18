import { BRAND_LIST, CATALOG_RACKETS } from "@/lib/catalog";

/** Merkenindex zoals in een winkel: tien merken op een rij, elk met het aantal modellen, naar de merkpagina. */
export function BrandMarquee() {
  return (
    <section id="merken" aria-labelledby="merken-titel" className="border-b border-panel-2 bg-bg">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="merken-titel" className="text-2xl font-bold">
            Shop per merk
          </h2>
          <a href="/merken/" className="link text-sm">
            Alle merken
          </a>
        </div>
        <ul className="mt-5 grid grid-cols-2 border-t border-l border-panel-2 sm:grid-cols-5">
          {BRAND_LIST.map((b) => {
            const n = CATALOG_RACKETS.filter((r) => r.brand === b.slug).length;
            return (
              <li key={b.slug} className="border-r border-b border-panel-2">
                <a href={`/merken/${b.slug}/`} className="group flex h-full items-baseline justify-between gap-3 px-4 py-5 transition-colors hover:bg-panel">
                  <span className="font-display text-[clamp(20px,1.9vw,28px)] leading-none font-bold tracking-tight [font-stretch:90%] group-hover:text-accent">{b.name}</span>
                  <span className="text-sm text-muted tabular-nums">{n}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
