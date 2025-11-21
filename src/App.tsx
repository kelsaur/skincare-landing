import Header from "./components/Header";
import Hero3D from "./components/Hero3D";
import Ingredients from "./components/Ingredients";
import Routine from "./components/Routine";
import Footer from "./components/Footer";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1, //lower - more smoothing
    });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", onLenisScroll);

    // 2. Tie Lenis to GSAP's ticker
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // 3. Collect ALL your sections (like the Routine one you showed)
    const sections = gsap.utils.toArray<HTMLElement>("section");

    // Build snap points: [0, 0.25, 0.5, 0.75, 1] etc
    const snapPoints =
      sections.length > 1
        ? sections.map((_, i) => i / (sections.length - 1))
        : [0];

    // 4. Global ScrollTrigger that just snaps scroll position
    const snapTrigger =
      sections.length > 1
        ? ScrollTrigger.create({
            start: 0,
            end: ScrollTrigger.maxScroll(window),
            scrub: 0.5, //smoothing when snapping
            snap: {
              snapTo: snapPoints,
              duration: 0.3,
              ease: "power1.inOut",
            },
          })
        : null;

    //ScrollTrigger calculates everything correctly
    ScrollTrigger.refresh();

    // 5. Cleanup
    return () => {
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();

      gsap.ticker.remove(raf);

      if (snapTrigger) {
        snapTrigger.kill();
      }
    };
  }, []);

  return (
    <>
      <Header />
      <Hero3D />
      <Ingredients />
      <Routine />
      <Footer />
    </>
  );
}

export default App;
