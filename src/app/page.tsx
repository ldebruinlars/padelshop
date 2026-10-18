import { Advice } from "@/components/advice";
import { BallPath } from "@/components/ball-path";
import { BrandMarquee } from "@/components/brand-marquee";
import { Categories } from "@/components/categories";
import { Collection } from "@/components/collection";
import { Exploded } from "@/components/exploded";
import { Finder } from "@/components/finder";
import { Footer } from "@/components/footer";
import { HeroLetters } from "@/components/hero-letters";
import { Nav } from "@/components/nav";
import { Reviews } from "@/components/reviews";
import { Testcenter } from "@/components/testcenter";
import { UspStrip } from "@/components/usp-strip";
import { Visit } from "@/components/visit";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroLetters />
        <UspStrip />
        <Collection />
        <Categories />
        <BallPath />
        <Testcenter />
        <BrandMarquee />
        <Finder />
        <Exploded />
        <Reviews />
        <Advice />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
