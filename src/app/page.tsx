import { Advice } from "@/components/advice";
import { BallPath } from "@/components/ball-path";
import { BrandMarquee } from "@/components/brand-marquee";
import { BrandScroller } from "@/components/brand-scroller";
import { Categories } from "@/components/categories";
import { RacketAnatomy } from "@/components/racket-anatomy";
import { Finder } from "@/components/finder";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { RacketWall } from "@/components/racket-wall";
import { Reviews } from "@/components/reviews";
import { Testcenter } from "@/components/testcenter";
import { Visit } from "@/components/visit";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <RacketWall />
        <BrandMarquee />
        <Testcenter />
        <BallPath />
        <Finder />
        <Categories />
        <RacketAnatomy />
        <Reviews />
        <BrandScroller />
        <Advice />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
