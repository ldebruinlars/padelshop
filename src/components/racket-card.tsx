"use client";

import { profile, brandName, styleColor, PLAYSTYLES, type CatalogRacket } from "@/lib/catalog";
import { euro } from "@/lib/site";
import { RacketArt } from "./racket-art";
import { photoOf } from "@/lib/all-rackets";

export function ProfileBar({ label, value, color, wide }: { label: string; value: number; color: string; wide?: boolean }) {
  return (
    <div className={`grid items-center gap-2 label text-[10px] sm:gap-3 sm:text-[11px] ${wide ? "grid-cols-[96px_1fr_28px]" : "grid-cols-[60px_1fr_24px] sm:grid-cols-[64px_1fr_28px]"}`}>
      <span className="text-muted">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-panel-2">
        <span className="bar-fill block h-full origin-left rounded-full" style={{ width: `${value * 10}%`, background: color }} />
      </span>
      <span className="text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

/** Productkaart. Een klik opent de snelle weergave (QuickView) vanuit deze kaart. */
export function RacketCard({ r, onOpen }: { r: CatalogRacket; onOpen: (r: CatalogRacket, from: HTMLElement) => void }) {
  const p = profile(r);
  const color = styleColor(r.playstyle);
  return (
    <article className="racket-card group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-fg/5 bg-panel transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-fg/15">
      <button
        type="button"
        onClick={(e) => onOpen(r, e.currentTarget.closest("article") as HTMLElement)}
        className="absolute inset-0 z-10 rounded-[var(--radius-card)]"
        aria-label={`Bekijk ${brandName(r.brand)} ${r.model}`}
      />
      <div className="racket-media relative aspect-square overflow-hidden bg-paper">
        <div className="absolute inset-x-6 top-11 bottom-2 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-3">
          <RacketArt shape={r.shape} color={color} photo={photoOf(r)} label={photoOf(r) ? r.model : `${r.model}, productfoto volgt`} />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {r.playstyle && (
            <span className="rounded-[var(--radius-control)] px-3 py-1 label text-on-accent" style={{ background: color }}>
              {PLAYSTYLES.find((s) => s.id === r.playstyle)?.label}
            </span>
          )}
          {r.shape && <span className="rounded-[var(--radius-control)] bg-bg px-3 py-1 label text-fg">{r.shape}</span>}
        </div>
      </div>
      <div className="grid flex-1 content-start gap-2.5 p-3 sm:p-4">
        <p className="label text-accent">{brandName(r.brand)}</p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="text-base leading-snug font-semibold sm:text-lg">{r.model}</h3>
          {r.price != null && <span className="shrink-0 font-semibold tabular-nums sm:text-lg">{euro(r.price)}</span>}
        </div>
        <p className="text-[13px] text-muted sm:text-sm">{[r.weight, r.balance && `balans ${r.balance}`, r.feel, r.level].filter(Boolean).join(" · ")}</p>
        <ProfileBar label="Kracht" value={p.power} color="#ff4a4a" />
        <ProfileBar label="Controle" value={p.control} color="#d9a48f" />
      </div>
    </article>
  );
}
