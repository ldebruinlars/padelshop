import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { BRAND_LIST, CATALOG_RACKETS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Merken | Racket Lab",
  description: `Padel rackets van ${BRAND_LIST.map((b) => b.name).join(", ")}. Bekijk per merk alle modellen en test ze in Almere.`,
  alternates: { canonical: "/merken/" },
};

export default function BrandsPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(96px+env(safe-area-inset-top))] pb-24">
        <header className="mx-auto max-w-[1400px] px-4 pt-10 pb-8 md:px-8">
          <h1 className="rise text-[clamp(40px,5.4vw,76px)] leading-[0.92] font-bold" style={{ "--i": 1 } as React.CSSProperties}>
            Tien topmerken
          </h1>
        </header>
        <ul className="mx-auto grid max-w-[1400px] gap-3 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-5">
          {BRAND_LIST.map((b, i) => {
            const n = CATALOG_RACKETS.filter((r) => r.brand === b.slug).length;
            return (
              <li key={b.slug} className="rise" style={{ "--i": i + 2 } as React.CSSProperties}>
                <a
                  href={`/merken/${b.slug}/`}
                  className="group flex h-full flex-col justify-between gap-8 rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-fg/15"
                >
                  <span>
                    <span className="block text-[clamp(28px,2.4vw,38px)] leading-none font-semibold tracking-tight">{b.name}</span>
                    <span className="mt-4 line-clamp-3 block text-sm text-muted">{b.about}</span>
                  </span>
                  <span>
                    <span className="flex items-center gap-2 label text-accent">
                      {n} {n === 1 ? "model" : "modellen"}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
