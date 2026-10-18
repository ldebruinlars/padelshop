import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { BRAND_LIST, CATALOG_RACKETS, SHAPES } from "@/lib/catalog";

export function generateStaticParams() {
  return BRAND_LIST.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = BRAND_LIST.find((x) => x.slug === slug);
  if (!b) return {};
  return {
    title: `${b.name} padel rackets | Racket Lab`,
    description: `Alle ${b.name} padel rackets met specificaties. ${b.about}`,
    alternates: { canonical: `/merken/${b.slug}/` },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = BRAND_LIST.find((x) => x.slug === slug);
  if (!b) notFound();
  const own = CATALOG_RACKETS.filter((r) => r.brand === slug);
  const prices = own.map((r) => r.price).filter((p): p is number => p != null);

  return (
    <>
      <Nav />
      <main className="pt-[calc(96px+env(safe-area-inset-top))]">
        <header className="mx-auto grid max-w-[1400px] gap-8 px-4 pt-10 pb-12 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <nav aria-label="Kruimelpad" className="rise text-sm text-muted">
              <a href="/" className="hover:text-fg">Home</a> / <a href="/merken/" className="hover:text-fg">Merken</a> / <span className="text-fg">{b.name}</span>
            </nav>
            <h1 className="rise mt-4 text-[clamp(52px,8vw,120px)] leading-[0.86] font-bold tracking-[-0.03em]" style={{ "--i": 1 } as React.CSSProperties}>
              {b.name}
            </h1>
            <p className="rise mt-6 max-w-xl text-lg text-fg/75" style={{ "--i": 2 } as React.CSSProperties}>
              {b.about}
            </p>
          </div>
          <dl className="rise grid grid-cols-3 gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <div className="rounded-[var(--radius-card)] bg-panel p-4">
              <dt className="label text-muted">Modellen</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums">{own.length}</dd>
            </div>
            <div className="col-span-2 rounded-[var(--radius-card)] bg-panel p-4">
              <dt className="label text-muted">Prijsklasse</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums">
                {prices.length ? `€${Math.floor(Math.min(...prices))} - €${Math.ceil(Math.max(...prices))}` : "Op aanvraag"}
              </dd>
            </div>
            <div className="col-span-3 flex flex-wrap gap-2 rounded-[var(--radius-card)] bg-panel p-4">
              <dt className="sr-only">Vormen</dt>
              {SHAPES.map((s) => {
                const n = own.filter((r) => r.shape === s.id).length;
                return (
                  <dd key={s.id} className={`rounded-[var(--radius-control)] border px-3 py-1 text-sm ${n ? "border-panel-2" : "border-transparent text-muted/60"}`}>
                    {s.label} · {n}
                  </dd>
                );
              })}
            </div>
          </dl>
        </header>
        <CatalogBrowser brand={slug} />
        <p className="mx-auto -mt-16 max-w-[1400px] px-4 pb-20 text-xs text-muted md:px-8">
          Specificaties en prijzen komen van de merk- en winkelsites (bron per racket in de snelle weergave). Prijzen kunnen afwijken; vraag in de winkel naar de actuele prijs.
        </p>
      </main>
      <Footer />
    </>
  );
}
