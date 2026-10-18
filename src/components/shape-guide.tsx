import { SHAPES } from "@/lib/catalog";
import { RacketArt } from "./racket-art";

const COLOR = { rond: "#d9a48f", druppel: "#e3bf78", diamant: "#ff4a4a" } as const;

/** Drie vormen als snelkoppeling naar het gefilterde assortiment. */
export function ShapeGuide() {
  return (
    <nav aria-label="Kies een vorm" className="mx-auto mb-12 grid max-w-[1400px] gap-3 px-4 sm:grid-cols-3 md:px-8">
      {SHAPES.map((s, i) => (
        <a
          key={s.id}
          href={`/rackets/?vorm=${s.id}`}
          className="rise group grid grid-cols-[72px_1fr] items-center gap-4 rounded-[var(--radius-card)] border border-fg/5 bg-panel p-4 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-fg/15"
          style={{ "--i": i + 3 } as React.CSSProperties}
        >
          <span className="h-24 transition-transform duration-500 group-hover:-rotate-6">
            <RacketArt shape={s.id} color={COLOR[s.id]} label={`Vorm ${s.label}`} />
          </span>
          <span>
            <span className="block text-xl font-semibold">{s.label}</span>
            <span className="mt-1 block text-sm leading-snug text-muted">{s.text}</span>
          </span>
        </a>
      ))}
    </nav>
  );
}
