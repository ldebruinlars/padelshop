import { CATEGORIES, SHOP, SITE, euro } from "@/lib/site";
import { ArrowIcon, Logo } from "./icons";
import { RevealPanel } from "./reveal-panel";

const SERVICE = [
  { label: "Racket-test boeken", href: "#testcenter" },
  { label: "Thuistest", href: "#thuistest" },
  { label: "Racketfinder", href: "#finder" },
  { label: "Veelgestelde vragen", href: "#advies" },
  { label: "Bezoek de winkel", href: "#bezoek" },
];

export function Footer() {
  return (
    <footer className="pb-[calc(10px+env(safe-area-inset-bottom))]">
      <RevealPanel className="bg-bg">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:px-12">
          <div>
            <h2 className="text-[clamp(32px,4vw,56px)] leading-[0.95] font-medium">
              Klaar om te <span className="accent">testen</span>?
            </h2>
            <p className="mt-3 max-w-md text-fg/70">Boek een sessie van 45 minuten en speel met de rackets die bij je passen.</p>
            <a href="#testcenter" className="mt-6 inline-flex items-center gap-3 rounded-full bg-accent py-2 pr-2 pl-5 font-semibold text-on-accent">
              Boek je racket-test
              <span className="grid size-8 place-items-center rounded-full bg-bg">
                <ArrowIcon className="size-3 text-accent" />
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <nav aria-label="Shop">
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Shop</p>
              <ul className="mt-4 grid gap-2">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <a href={c.online ? "#collectie" : "#bezoek"} className="text-fg/85 hover:text-accent">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Service">
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Service</p>
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
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 border-t border-fg/5 px-6 py-8 md:px-12">
          <div className="flex items-center gap-3">
            <Logo className="size-7" />
            <div>
              <p className="font-semibold">{SITE.name}</p>
              <p className="text-sm text-muted">{SITE.location} · samen met All Court Academy</p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2 font-ui text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            <li className="rounded-full border border-panel-2 px-3 py-1.5">Gratis vanaf {euro(SHOP.freeShippingFrom)}</li>
            <li className="rounded-full border border-panel-2 px-3 py-1.5">{SHOP.returnDays} dagen bedenktijd</li>
            {SHOP.payLater && <li className="rounded-full border border-panel-2 px-3 py-1.5">{SHOP.payLater}</li>}
          </ul>
        </div>
      </RevealPanel>
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4 px-6 py-6 text-xs text-muted">
        <span>© 2026 {SITE.name}</span>
        <span>Verzenden en retour · Algemene voorwaarden · Privacy</span>
      </div>
    </footer>
  );
}
