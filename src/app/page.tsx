import { Advice } from "@/components/advice";
import { BallPath } from "@/components/ball-path";
import { BrandMarquee } from "@/components/brand-marquee";
import { Categories } from "@/components/categories";
import { Exploded } from "@/components/exploded";
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
        <Exploded />
        <Reviews />
        <Advice />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
