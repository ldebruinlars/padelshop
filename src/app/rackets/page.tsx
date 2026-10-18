import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ShapeGuide } from "@/components/shape-guide";
import { BRAND_LIST, CATALOG_RACKETS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Padel rackets | Racket Lab",
  description: `${CATALOG_RACKETS.length} padel rackets van ${BRAND_LIST.length} topmerken. Filter op vorm, hardheid, speelstijl en niveau, en test ze eerst in Almere.`,
  alternates: { canonical: "/rackets/" },
};

export default function RacketsPage() {
  return (
    <>
      <Nav />
      <main className="pt-36">
        <header className="mx-auto max-w-[1400px] px-4 pb-10 md:px-8">
          <p className="eyebrow rise">Assortiment</p>
          <h1 className="rise mt-4 text-[clamp(44px,7vw,104px)] leading-[0.92] font-medium" style={{ "--i": 1 } as React.CSSProperties}>
            Alle <span className="accent">rackets</span>
          </h1>
          <p className="rise mt-5 max-w-xl text-lg text-fg/75" style={{ "--i": 2 } as React.CSSProperties}>
            {CATALOG_RACKETS.length} modellen van {BRAND_LIST.length} merken. Klik op een racket voor alle specificaties, of kies eerst een vorm.
          </p>
        </header>
        <ShapeGuide />
        <CatalogBrowser />
      </main>
      <Footer />
    </>
  );
}
