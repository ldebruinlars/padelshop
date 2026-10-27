import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight } from "next/font/google";
import { CodeCatcher } from "@/components/code-catcher";
import { Consent } from "@/components/consent";
import { CONFIG } from "@/lib/config";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SITE } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

const title = `${SITE.name} | Padel rackets testen met een coach bij Poort Padel, Almere`;
const description =
  "Test 3 padelrackets op maat met een coach bij Poort Padel in Almere. 30 minuten voor €30, met per racket een eerlijk oordeel. Daarna koop je voor de adviesprijs.";

// Structured data: het testcenter als lokaal bedrijf, met de testvormen als aanbod
const businessLd = {
  "@context": "https://schema.org",
  "@type": "SportingGoodsStore",
  name: SITE.name,
  url: SITE.url,
  description,
  address: { "@type": "PostalAddress", streetAddress: "Neonweg 62", addressLocality: "Almere", addressCountry: "NL" },
  location: { "@type": "Place", name: "Poort Padel" },
  ...(CONFIG.whatsappNumber ? { telephone: `+${CONFIG.whatsappNumber}` } : {}),
  ...(CONFIG.googleBusinessUrl ? { sameAs: [CONFIG.googleBusinessUrl] } : {}),
  makesOffer: [
    { name: "Racket Fit met coach, 1 persoon, 30 minuten", price: "30.00" },
    { name: "Racket Fit met coach, 2 personen, 30 minuten", price: "52.50" },
    { name: "Racket Fit, koppel mij aan een andere tester", price: "26.25" },
    { name: "Balmachine-uur, 60 minuten, 1 speler, 5 rackets", price: "60.00" },
  ].map((o) => ({ "@type": "Offer", priceCurrency: "EUR", price: o.price, itemOffered: { "@type": "Service", name: o.name } })),
};

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
      <body className={`${interTight.variable} ${archivo.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }} />
        <CodeCatcher />
        <SmoothScroll>{children}</SmoothScroll>
        <Consent />
      </body>
    </html>
  );
}
