import type { Metadata } from "next";
import { Fraunces, Inter_Tight, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SITE } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic", "normal"], weight: ["400", "500"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  title: `${SITE.name} | Padel rackets testen en kopen in Almere`,
  description:
    "Padel webshop met eigen racket-testcenter bij Poort Padel in Almere. Test rackets met een coach van All Court Academy en koop pas als het goed voelt.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={`${interTight.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
