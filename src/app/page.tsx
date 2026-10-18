import { BallPath } from "@/components/ball-path";
import { BrandMarquee } from "@/components/brand-marquee";
import { Collection } from "@/components/collection";
import { Exploded } from "@/components/exploded";
import { Finder } from "@/components/finder";
import { Footer } from "@/components/footer";
import { HeroLetters } from "@/components/hero-letters";
import { Nav } from "@/components/nav";
import { Racket360 } from "@/components/racket-360";
import { Testcenter } from "@/components/testcenter";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroLetters />
        <BallPath />
        <Testcenter />
        <BrandMarquee />
        <Racket360 />
        <Collection />
        <Exploded />
        <Finder />
      </main>
      <Footer />
    </>
  );
}
