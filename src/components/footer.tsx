import { SITE } from "@/lib/site";
import { ArrowIcon, Logo } from "./icons";
import { RevealPanel } from "./reveal-panel";

export function Footer() {
  return (
    <footer className="pb-[calc(10px+env(safe-area-inset-bottom))]">
      <RevealPanel className="bg-bg">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:px-12">
          <div>
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Logo className="size-7" /> {SITE.name}
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">Padel rackets testen en kopen bij Poort Padel in Almere. Samen met All Court Academy.</p>
            <p className="mt-6 text-sm text-muted">{SITE.location}</p>
          </div>
          <div>
            <h2 className="text-[clamp(32px,4vw,56px)] leading-[0.95] font-medium">
              Klaar om te <span className="accent">testen</span>?
            </h2>
            <p className="mt-3 text-fg/70">Boek een sessie van 45 minuten en speel met de rackets die bij je passen.</p>
            <a href="#testcenter" className="mt-6 inline-flex items-center gap-3 rounded-full bg-accent py-2 pr-2 pl-5 font-semibold text-on-accent">
              Boek je racket-test
              <span className="grid size-8 place-items-center rounded-full bg-bg">
                <ArrowIcon className="size-3 text-accent" />
              </span>
            </a>
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
