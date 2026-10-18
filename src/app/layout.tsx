import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SITE } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic", "normal"], weight: ["400", "500"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["500", "600"] });

const title = `${SITE.name} | Padel rackets testen en kopen in Almere`;
const description =
  "Padel webshop met eigen racket-testcenter bij Poort Padel in Almere. Test rackets met een coach van All Court Academy en koop pas als het goed voelt.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "nl_NL", url: "/", siteName: SITE.name, title, description, images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#14110f" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={`${interTight.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
