import type { Shape } from "@/lib/catalog";

const NAMES: Record<string, string> = { "#ff4a4a": "power", "#d9a48f": "control", "#e3bf78": "allround" };

/**
 * Productafbeelding. De eigen lijn heeft een vrijstaande foto (photo); voor merkrackets een neutrale tekening per kopvorm.
 * Bewust een tekening (geen nep-foto), in de kleur van de speelstijl. De bestanden komen uit scripts/racket-art.mjs.
 */
export function RacketArt({ shape, color, label, eager, photo }: { shape: Shape | null; color: string; label?: string; eager?: boolean; photo?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo ?? `/media/art/${shape ?? "druppel"}-${NAMES[color] ?? "neutraal"}.svg`}
      alt={label ?? "Racket, productfoto volgt"}
      width={200}
      height={300}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`size-full object-contain [-webkit-user-drag:none]`}
    />
  );
}
