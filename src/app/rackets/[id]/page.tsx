import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { OrderPanel } from "@/components/order-panel";
import { ProfileBar } from "@/components/racket-card";
import { Radar } from "@/components/radar";
import { RacketArt } from "@/components/racket-art";
import { BRAND_LIST, CATALOG_RACKETS, PLAYSTYLES, brandName, ratings, styleColor } from "@/lib/catalog";
import { LAYERS, SHAPE_GUIDE } from "@/lib/racket-guide";
import { euro } from "@/lib/site";
import { BULLPADEL_SOURCE, techFor } from "@/lib/tech";
import { Model3D } from "@/components/model-3d";
import { OWN_BRAND, OWN_RACKETS, type OwnRacket } from "@/lib/own-line";

export function generateStaticParams() {
  return [...CATALOG_RACKETS, ...OWN_RACKETS].map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = [...CATALOG_RACKETS, ...OWN_RACKETS].find((x) => x.id === id);
  if (!r) return {};
  const title = `${brandName(r.brand)} ${r.model} | Racket Lab`;
  return { title, description: r.description ?? undefined, alternates: { canonical: `/rackets/${r.id}/` } };
}

/**
 * Racketpagina: hier komt de QR-code op het prijskaartje aan de wand op uit. Alles over dit ene racket,
 * de opbouw, en direct reserveren met accessoires, coachcode en lesvoordeel.
 */
export default async function RacketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = [...CATALOG_RACKETS, ...OWN_RACKETS].find((x) => x.id === id);
  if (!r) notFound();
  const own = OWN_RACKETS.find((x) => x.id === id) as OwnRacket | undefined;
  const brand = own ? OWN_BRAND : BRAND_LIST.find((b) => b.slug === r.brand);
  const shape = SHAPE_GUIDE.find((s) => s.id === r.shape);
  const similar = own ? OWN_RACKETS.filter((x) => x.id !== r.id) : CATALOG_RACKETS.filter((x) => x.id !== r.id && x.shape === r.shape && x.playstyle === r.playstyle).slice(0, 4);
  const specs: [string, string | null][] = [
    ["Vorm", r.shape],
    ["Gewicht", r.weight],
    ["Balans", r.balance],
    ["Kern", r.core],
    ["Slagvlak", r.face],
    ["Frame", r.frame],
    ["Hardheid", r.feel],
    ["Niveau", r.level],
    ["Speelstijl", PLAYSTYLES.find((s) => s.id === r.playstyle)?.label ?? null],
  ];
  // Merknamen van technologieën (uit de Bullpadel-catalogus) alleen bij Bullpadel-rackets tonen
  const tech = r.brand === "bullpadel" ? techFor([r.core, r.face, r.frame, r.description].join(" ")) : [];
  const layerSpec: Record<string, string | null> = { face: r.face, core: [r.core, r.feel].filter(Boolean).join(" · ") || null, frame: r.frame };

  return (
    <>
      <Nav />
      <main className="pt-[calc(96px+env(safe-area-inset-top))]">
        <div className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8">
          <nav aria-label="Kruimelpad" className="text-sm text-muted">
            <a href="/rackets/" className="hover:text-fg">
              Rackets
            </a>{" "}
            /{" "}
            <a href={`/merken/${r.brand}/`} className="hover:text-fg">
              {brandName(r.brand)}
            </a>{" "}
            / <span className="text-fg">{r.model}</span>
          </nav>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pt-6 pb-16 md:px-8 lg:grid-cols-[1fr_1.05fr]">
          {/* Beeld */}
          {own ? (
            <div className="grid gap-3 lg:sticky lg:top-28 lg:self-start">
              <div className="relative rounded-[var(--radius-panel)] bg-paper">
                {own.model3d ? (
                  <Model3D src={own.model3d} poster={own.images.cutout} alt={`${r.model} in 3D`} autoStart className="mx-auto aspect-[3/4] max-h-[66svh]" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={own.images.cutout} alt={r.model} className="mx-auto aspect-[3/4] max-h-[66svh] object-contain p-6" />
                )}
                <p className="label pointer-events-none absolute top-3 left-4 text-on-accent/70">Concept · sleep om te draaien</p>
              </div>
              <ul className="grid grid-cols-3 gap-3">
                {([["Voorkant", own.images.front], ["Schuin", own.images.angle], ["Achterkant", own.images.back]] as const).map(([label, src]) => (
                  <li key={label} className="overflow-hidden rounded-[var(--radius-card)] bg-[#e6e3de]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${r.model}, ${label.toLowerCase()}`} loading="lazy" className="aspect-[2/3] w-full object-cover" />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="relative rounded-[var(--radius-panel)] bg-paper p-8 lg:sticky lg:top-28 lg:self-start">
              <div className="mx-auto aspect-[2/3] max-h-[62svh]">
                <RacketArt shape={r.shape} color={styleColor(r.playstyle)} label={`Tekening van de ${r.model}, productfoto volgt`} eager />
              </div>
              <p className="label absolute bottom-3 left-4 text-on-accent/70">Illustratie · productfoto volgt</p>
            </div>
          )}

          {/* Info en bestellen */}
          <div className="grid content-start gap-8">
            <header>
              <p className="label text-accent">{brandName(r.brand)}</p>
              <h1 className="mt-2 text-[clamp(34px,4vw,56px)] leading-[0.95] font-bold">{r.model}</h1>
              {r.price != null && (
                <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-4xl font-bold tabular-nums">{euro(r.price)}</span>
                  {r.priceNote && <span className="text-sm text-muted">{r.priceNote}</span>}
                </p>
              )}
              {r.description && <p className="mt-4 max-w-[62ch] text-lg text-fg/80">{r.description}</p>}
            </header>

            {own && (
              <p className="rounded-[var(--radius-control)] bg-panel px-4 py-3 text-sm text-fg/80">
                <strong className="font-semibold">Eigen ontwerp, in ontwikkeling.</strong> De specificaties hieronder zijn onze ontwerpdoelen. Zet je op de lijst, dan hoor je als eerste wanneer je hem kunt testen.
              </p>
            )}
            <OrderPanel racket={{ id: r.id, label: `${brandName(r.brand)} ${r.model}`, price: r.price }} interest={Boolean(own)} />

            <section aria-labelledby="eigenschappen">
              <h2 id="eigenschappen" className="text-2xl font-bold">
                Eigenschappen
              </h2>
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,320px)_1fr]">
                <Radar values={ratings(r).map((x) => ({ label: x.label, value: x.value }))} label={`Eigenschappen van de ${r.model}`} />
                <div className="grid gap-y-3">
                {ratings(r).map((x) => (
                  <div key={x.id}>
                    <ProfileBar label={x.label} value={x.value} color={x.color} wide />
                    <p className="mt-1 text-xs text-muted">{x.hint}</p>
                  </div>
                ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Racket Lab-schatting op basis van vorm, balans, gewicht, kern en slagvlak. Geen labtest.</p>
            </section>

            <section aria-labelledby="specs">
              <h2 id="specs" className="text-2xl font-bold">
                Specificaties
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
                {specs
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="border-b border-panel-2 py-2.5">
                      <dt className="label text-muted">{k}</dt>
                      <dd className="mt-0.5 first-letter:uppercase">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>

            <section aria-labelledby="opbouw">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="opbouw" className="text-2xl font-bold">
                  Hoe dit racket is opgebouwd
                </h2>
                <a href={`/?opbouw=${r.id}#anatomie`} className="link text-sm">
                  Bekijk de opbouw in 3D
                </a>
              </div>
              <ol className="mt-3 grid">
                {LAYERS.filter((l) => l.id === "face" || l.id === "core" || l.id === "frame").map((l) => (
                  <li key={l.id} className="grid gap-1 border-b border-panel-2 py-3 sm:grid-cols-[160px_1fr]">
                    <span className="font-semibold">{l.name}</span>
                    <span>
                      <span className="block text-fg/90">{layerSpec[l.id] ?? "Niet opgegeven door het merk"}</span>
                      <span className="mt-1 block text-sm text-muted">{l.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {shape && (
                <p className="mt-4 text-fg/80">
                  <strong className="font-semibold">{shape.label}:</strong> {shape.outline} Sweet spot {shape.sweetSpot.label.toLowerCase()}, balans {shape.balance.mm}. Past bij {shape.suits.toLowerCase()}.
                </p>
              )}
            </section>

            {tech.length > 0 && (
              <section aria-labelledby="tech">
                <h2 id="tech" className="text-2xl font-bold">
                  Technologie in dit racket
                </h2>
                <dl className="mt-3 grid border-t border-panel-2">
                  {tech.map((t) => (
                    <div key={t.name} className="grid gap-1 border-b border-panel-2 py-3 sm:grid-cols-[160px_1fr]">
                      <dt className="font-semibold">
                        {t.name}
                        <span className="label block text-[11px] text-muted">{t.group}</span>
                      </dt>
                      <dd className="text-fg/80">{t.text}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-muted">
                  Uitleg van het merk:{" "}
                  <a href={BULLPADEL_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                    {BULLPADEL_SOURCE.label}
                  </a>
                </p>
              </section>
            )}

            {brand && (
              <section aria-labelledby="merk">
                <h2 id="merk" className="text-2xl font-bold">
                  Over {brand.name}
                </h2>
                <p className="mt-2 max-w-[62ch] text-fg/80">{brand.about}</p>
              </section>
            )}

            {r.sources.length > 0 && (
              <p className="text-xs text-muted">
                Specificaties:{" "}
                {r.sources.map((s, i) => (
                  <span key={s}>
                    {i > 0 && " · "}
                    <a href={s} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                      {new URL(s).hostname.replace(/^www\./, "")}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="vergelijkbaar" className="border-t border-panel-2 bg-bg">
            <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
              <h2 id="vergelijkbaar" className="text-2xl font-bold">
                {own ? "De rest van de eigen lijn" : "Vergelijkbare rackets"}
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {similar.map((x) => (
                  <li key={x.id}>
                    <a href={`/rackets/${x.id}/`} className="group block rounded-[var(--radius-card)] border border-panel-2 p-3 transition-colors hover:border-fg/40">
                      <span className="block h-36 rounded-[var(--radius-control)] bg-paper p-3">
                        {"images" in x ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(x as OwnRacket).images.cutout} alt="" loading="lazy" className="size-full object-contain" />
                        ) : (
                          <RacketArt shape={x.shape} color={styleColor(x.playstyle)} label="" />
                        )}
                      </span>
                      <span className="label mt-3 block text-accent">{brandName(x.brand)}</span>
                      <span className="mt-1 block font-semibold">{x.model}</span>
                      {x.price != null && <span className="mt-1 block text-sm text-muted tabular-nums">{euro(x.price)}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
