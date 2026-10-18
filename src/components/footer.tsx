import { CATEGORIES, SITE } from "@/lib/site";
import { Logo } from "./icons";
import { RevealPanel } from "./reveal-panel";

const SERVICE = [
  { label: "Racket-test boeken", href: "/#testcenter" },
  { label: "Thuistest", href: "/#thuistest" },
  { label: "Racketfinder", href: "/#finder" },
  { label: "Veelgestelde vragen", href: "/#advies" },
  { label: "Bezoek de winkel", href: "/#bezoek" },
];

export function Footer() {
  return (
    <footer className="pb-[calc(10px+env(safe-area-inset-bottom))]">
      <RevealPanel className="bg-bg">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:px-12">
          <div>
            <a href="/" className="flex items-center gap-3 font-display text-2xl font-bold [font-stretch:90%]">
              <Logo className="size-8" />
              {SITE.name}
            </a>
            <p className="mt-4 max-w-sm text-fg/75">Padelrackets van tien merken. Test eerst, koop dan.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <nav aria-label="Shop">
              <p className="label text-muted">Shop</p>
              <ul className="mt-4 grid gap-2">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <a href={c.online ? "/rackets/" : "/#bezoek"} className="text-fg/85 hover:text-accent">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Service">
              <p className="label text-muted">Service</p>
              <ul className="mt-4 grid gap-2">
                {SERVICE.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} className="text-fg/85 hover:text-accent">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </RevealPanel>
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4 px-6 py-6 text-xs text-muted">
        <span>© 2026 {SITE.name}</span>
        <span>Verzenden en retour · Algemene voorwaarden · Privacy</span>
      </div>
    </footer>
  );
}
