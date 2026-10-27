"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BULLPADEL_SOURCE, FIBRE_SCALE, RUBBER_SCALE, TECH } from "@/lib/tech";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Wordt true zodra het element in beeld komt, zodat de animatie pas dan speelt. */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

// Hardheid per rubber (0 zacht - 1 hard). MultiEva: zacht voor rustige ballen, hard voor snelle (twee dichtheden).
const RUBBER_HARD: Record<string, { slow: number; fast: number; color: string }> = {
  HardEva: { slow: 0.95, fast: 1, color: "#9c8668" },
  MultiEva: { slow: 0.4, fast: 0.85, color: "#c4ae88" },
  SoftEva: { slow: 0.45, fast: 0.5, color: "#dccaa6" },
  Evalastic: { slow: 0.3, fast: 0.35, color: "#e6d8bb" },
  CloudEva: { slow: 0.1, fast: 0.15, color: "#f1e8d6" },
};

// Stijfheid per vezel (0 soepel - 1 stijf) en hoe de weving eruitziet. Volgorde en stijfheid zoals Bullpadel ze op een rij zet.
const FIBRE: Record<string, { stiff: number; cell: number; a: string; b: string }> = {
  "XtendCarbon 3K": { stiff: 1, cell: 4, a: "#1f1b18", b: "#3a332d" },
  "TriCarbon 18K": { stiff: 0.9, cell: 9, a: "#1f1b18", b: "#45403a" },
  "XtendCarbon 12K": { stiff: 0.82, cell: 7, a: "#1f1b18", b: "#3a332d" },
  "Aluminized 18K": { stiff: 0.6, cell: 9, a: "#55575a", b: "#9a9da1" },
  Fibrix: { stiff: 0.45, cell: 6, a: "#2a2622", b: "#b9bcb4" },
  Glaphite: { stiff: 0.38, cell: 6, a: "#3a3631", b: "#cfd2cb" },
  Polyglass: { stiff: 0.25, cell: 6, a: "#c3c7bf", b: "#e3e6e0" },
  "Elastic Fiber": { stiff: 0.1, cell: 6, a: "#cfd3cb", b: "#eef0ec" },
};

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-3 text-sm">
      <span className="text-fg/75">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-panel-2">
        <span className="block h-full origin-left rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `scaleX(${Math.max(0.05, Math.min(1, value))})` }} />
      </span>
    </div>
  );
}

/** Doorsnede van het racket: de bal duikt de kern in en komt terug. Hoe zachter het rubber, hoe dieper en hoe langer de bal blijft. */
export function CoreLab() {
  const [rubber, setRubber] = useState("MultiEva");
  const [fast, setFast] = useState(false);
  const [run, setRun] = useState(0);
  const [svg, seen] = useSeen<SVGSVGElement>();
  const h = RUBBER_HARD[rubber][fast ? "fast" : "slow"];
  const dent = (1 - h) * (fast ? 22 : 13) + (fast ? 4 : 2);
  // Vuistregels uit de gidsen: zacht = makkelijke balafgifte bij rustige ballen, hard = kracht bij harde slagen
  const exit = fast ? 0.35 + h * 0.6 : 0.3 + (1 - h) * 0.6;

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const ball = el.querySelector(".lab-ball");
    const trail = el.querySelector(".lab-trail");
    const st = { d: 0 };
    const draw = () => {
      el.querySelector(".lab-core")?.setAttribute("d", `M112 24 L150 24 Q${150 - st.d * 2} 110 150 196 L112 196 Z`);
      el.querySelector(".lab-skin")?.setAttribute("d", `M151 24 Q${151 - st.d * 2} 110 151 196`);
    };
    draw();
    if (reduced() || !seen) return;
    const tIn = fast ? 0.35 : 0.6;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.set(ball, { x: 200, opacity: 1 })
      .set(trail, { opacity: 0 })
      .to(ball, { x: 0, duration: tIn, ease: "none" })
      .to(st, { d: dent, duration: 0.08 + (1 - h) * 0.14, ease: "power2.out", onUpdate: draw })
      .to(ball, { x: -dent, duration: 0.08 + (1 - h) * 0.14, ease: "power2.out" }, "<")
      .to(st, { d: 0, duration: 0.12 + (1 - h) * 0.12, ease: "power2.in", onUpdate: draw })
      .to(ball, { x: 0, duration: 0.12 + (1 - h) * 0.12, ease: "power2.in" }, "<")
      .to(trail, { opacity: 1, duration: 0.1 })
      .to(ball, { x: 230, duration: 1.1 - exit * 0.85, ease: "none" }, "<")
      .to(trail, { opacity: 0, duration: 0.3 })
      // Klaar: de bal ligt weer rechts klaar voor de volgende slag
      .to(ball, { opacity: 0, duration: 0.15 }, "<")
      .set(ball, { x: 200 })
      .to(ball, { opacity: 1, duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [rubber, fast, run, dent, h, exit, seen]);

  return (
    <div className="rounded-[var(--radius-card)] border border-panel-2 p-5 md:p-6">
      <h4 className="text-xl font-bold">De kern van dichtbij</h4>
      <p className="mt-1 text-sm text-fg/70">Doorsnede van het slagvlak. Kies een rubber en een bal: zie hoe diep de bal in de kern zakt en hoe snel hij terugkomt.</p>
      <svg ref={svg} viewBox="0 0 400 220" className="mt-4 w-full rounded-[var(--radius-control)] bg-ink" aria-hidden="true">
        {/* Achterkant, kern en voorkant van het racket */}
        <rect x="106" y="24" width="6" height="172" fill="#3a312b" />
        <path className="lab-core" d="M112 24 L150 24 Q150 110 150 196 L112 196 Z" fill={RUBBER_HARD[rubber].color} />
        {rubber === "MultiEva" && <rect x="112" y="24" width="10" height="172" fill="#9c8668" opacity="0.7" />}
        {rubber === "MultiEva" && <rect x="140" y="24" width="10" height="172" fill="#9c8668" opacity="0.7" />}
        <path className="lab-skin" d="M151 24 Q151 110 151 196" fill="none" stroke="#2b2622" strokeWidth="5" />
        <text x="129" y="214" textAnchor="middle" fontSize="11" fill="#b3a595">
          kern
        </text>
        {/* Bal */}
        <g className="lab-ball" transform="translate(200 0)">
          <g transform="translate(168 110)">
            <circle r="16" fill="#e3e86a" />
            <path d="M-11 -10c6 5 6 15 0 20M11 -10c-6 5-6 15 0 20" fill="none" stroke="#f6f7e0" strokeWidth="2" />
          </g>
        </g>
        <g className="lab-trail" opacity="0" stroke="#f06a30" strokeWidth="2.5" strokeLinecap="round">
          <line x1="200" x2={200 + exit * 150} y1="100" y2="100" />
          <line x1="210" x2={210 + exit * 130} y1="110" y2="110" />
          <line x1="200" x2={200 + exit * 150} y1="120" y2="120" />
        </g>
        <text x="390" y="20" textAnchor="end" fontSize="11" fill="#b3a595">
          {fast ? "harde smash" : "rustige bal"}
        </text>
      </svg>
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Rubber van de kern">
        {RUBBER_SCALE.map((r) => (
          <button key={r.name} type="button" className="chip" aria-pressed={rubber === r.name} onClick={() => setRubber(r.name)}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Soort bal">
        {[false, true].map((f) => (
          <button key={String(f)} type="button" className="chip" aria-pressed={fast === f} onClick={() => setFast(f)}>
            {f ? "Harde smash" : "Rustige bal"}
          </button>
        ))}
        <button type="button" className="link ml-2 text-sm" onClick={() => setRun((n) => n + 1)}>
          Nog een keer
        </button>
      </div>
      <p className="mt-3 min-h-[3lh] text-sm text-fg/80" aria-live="polite">
        <strong className="font-semibold">{rubber}:</strong> {RUBBER_SCALE.find((r) => r.name === rubber)?.text}
      </p>
      <div className="mt-3 grid gap-2">
        <Bar label={`Balafgifte bij een ${fast ? "smash" : "rustige bal"}`} value={exit} />
        <Bar label="Comfort voor je arm" value={0.2 + (1 - RUBBER_HARD[rubber].fast) * 0.75} />
        <Bar label="Controle bij harde slagen" value={0.25 + RUBBER_HARD[rubber].fast * 0.7} />
      </div>
    </div>
  );
}

/** Het slagvlak: de weving van dichtbij, en hoe het vlak buigt en natrilt bij de klap. Stijver = minder buiging, meer trilling. */
export function FaceLab() {
  const [fibre, setFibre] = useState("XtendCarbon 12K");
  const [run, setRun] = useState(0);
  const [svg, seen] = useSeen<SVGSVGElement>();
  const f = FIBRE[fibre];

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const st = { b: 0 };
    const draw = () => el.querySelector(".lab-face")?.setAttribute("d", `M290 24 Q${290 - st.b * 2} 110 290 196`);
    draw();
    if (reduced() || !seen) return;
    const ball = el.querySelector(".lab-ball2");
    const bend = (1 - f.stiff) * 12 + 2;
    const shake = f.stiff * 5 + 0.5;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.set(ball, { x: 70, opacity: 1 })
      .to(ball, { x: 0, duration: 0.4, ease: "none" })
      .to(st, { b: bend, duration: 0.12, ease: "power2.out", onUpdate: draw })
      .to(ball, { x: -bend, duration: 0.12, ease: "power2.out" }, "<")
      .to(st, { b: 0, duration: 0.12, ease: "power2.in", onUpdate: draw })
      .to(ball, { x: 80, opacity: 0, duration: 0.5, ease: "none" })
      // Natrillen: stijf carbon trilt harder en langer door naar je arm
      .to(st, { keyframes: [shake, -shake * 0.8, shake * 0.6, -shake * 0.4, shake * 0.2, 0].map((b) => ({ b, duration: 0.06 })), onUpdate: draw }, "<")
      .set(ball, { x: 70 })
      .to(ball, { opacity: 1, duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [fibre, run, f.stiff, seen]);

  return (
    <div className="rounded-[var(--radius-card)] border border-panel-2 p-5 md:p-6">
      <h4 className="text-xl font-bold">Het slagvlak van dichtbij</h4>
      <p className="mt-1 text-sm text-fg/70">Links de weving onder een vergrootglas, rechts het vlak van opzij bij de klap. Soepele vezels buigen mee, stijve vezels trillen na.</p>
      <svg ref={svg} viewBox="0 0 400 220" className="mt-4 w-full rounded-[var(--radius-control)] bg-ink" aria-hidden="true">
        <defs>
          <pattern id="lab-weave" width={f.cell * 2} height={f.cell * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={f.cell * 2} height={f.cell * 2} fill={f.a} />
            <rect width={f.cell} height={f.cell} fill={f.b} />
            <rect x={f.cell} y={f.cell} width={f.cell} height={f.cell} fill={f.b} />
          </pattern>
          <clipPath id="lab-lens">
            <circle cx="100" cy="110" r="78" />
          </clipPath>
        </defs>
        <g clipPath="url(#lab-lens)">
          <rect x="0" y="0" width="200" height="220" fill="url(#lab-weave)" />
        </g>
        <circle cx="100" cy="110" r="78" fill="none" stroke="#6b5f55" strokeWidth="3" />
        <path d="M156 166l26 26" stroke="#6b5f55" strokeWidth="8" strokeLinecap="round" />
        <path className="lab-face" d="M290 24 Q290 110 290 196" fill="none" stroke={f.stiff > 0.5 ? "#2f2924" : "#c3c7bf"} strokeWidth="7" strokeLinecap="round" />
        <g className="lab-ball2" transform="translate(70 0)">
          <g transform="translate(308 110)">
            <circle r="14" fill="#e3e86a" />
          </g>
        </g>
        <text x="290" y="214" textAnchor="middle" fontSize="11" fill="#b3a595">
          van opzij
        </text>
      </svg>
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Vezel van het slagvlak">
        {FIBRE_SCALE.map((x) => (
          <button key={x.name} type="button" className="chip" aria-pressed={fibre === x.name} onClick={() => setFibre(x.name)}>
            {x.name}
          </button>
        ))}
        <button type="button" className="link ml-2 text-sm" onClick={() => setRun((n) => n + 1)}>
          Nog een keer
        </button>
      </div>
      <p className="mt-3 min-h-[3lh] text-sm text-fg/80" aria-live="polite">
        <strong className="font-semibold">{fibre}:</strong> {FIBRE_SCALE.find((x) => x.name === fibre)?.text}
      </p>
      <div className="mt-3 grid gap-2">
        <Bar label="Kracht bij harde slagen" value={0.25 + f.stiff * 0.7} />
        <Bar label="Balafgifte bij rustige slagen" value={0.25 + (1 - f.stiff) * 0.7} />
        <Bar label="Trilling naar je arm" value={0.15 + f.stiff * 0.8} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Het K-getal is het aantal duizenden draden per bundel. Bullpadel zet 3K bovenaan als hardste; veel winkels noemen 3K juist soepel. Het getal alleen zegt dus weinig: de stijfheid hangt ook af van het aantal lagen, de richting en de hars.
      </p>
    </div>
  );
}

/** Alle technieken uit de Bullpadel-catalogus per onderdeel, als naslag onder de racketverkenner. */
export function LayerLab() {
  const groups = [...new Set(TECH.map((t) => t.group))];
  return (
    <details className="mt-8 rounded-[var(--radius-card)] border border-panel-2 px-5 py-4">
      <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">Alle technieken uitgelegd ({TECH.length})</summary>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g}>
            <p className="label text-muted">{g}</p>
            <ul className="mt-2 grid gap-2">
              {TECH.filter((t) => t.group === g).map((t) => (
                <li key={t.name} className="text-sm">
                  <strong className="font-semibold">{t.name}:</strong> <span className="text-fg/75">{t.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <a href={BULLPADEL_SOURCE.url} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-block text-xs text-muted">
        {BULLPADEL_SOURCE.label}. Demping en spin zijn claims van het merk.
      </a>
    </details>
  );
}
