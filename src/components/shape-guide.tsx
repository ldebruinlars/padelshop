import { SHAPES } from "@/lib/catalog";
import { RacketArt } from "./racket-art";

const COLOR = { rond: "#d9a48f", druppel: "#e3bf78", diamant: "#ff4a4a" } as const;

/** Drie vormen als snelkoppeling naar het gefilterde assortiment. */
export function ShapeGuide() {
  return (
    <nav aria-label="Kies een vorm" className="mx-auto mb-8 grid max-w-[1400px] grid-cols-3 gap-2 px-4 sm:mb-12 sm:gap-3 md:px-8">
      {SHAPES.map((s, i) => (
        <a
          key={s.id}
          href={`/rackets/?vorm=${s.id}`}
          className="rise group grid items-center gap-2 rounded-[var(--radius-card)] border border-fg/5 bg-panel p-3 text-center sm:grid-cols-[72px_1fr] sm:gap-4 sm:p-4 sm:text-left transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-fg/15"
          style={{ "--i": i + 3 } as React.CSSProperties}
        >
          <span className="mx-auto h-14 w-10 sm:h-24 sm:w-auto transition-transform duration-500 group-hover:-rotate-6">
            <RacketArt shape={s.id} color={COLOR[s.id]} label={`Vorm ${s.label}`} />
          </span>
          <span>
            <span className="block font-semibold sm:text-xl">{s.label}</span>
            <span className="mt-1 hidden text-sm leading-snug text-muted sm:block">{s.text}</span>
          </span>
        </a>
      ))}
    </nav>
  );
}
