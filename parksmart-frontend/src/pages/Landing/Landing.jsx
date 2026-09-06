import "./parksmart-home-main/src/styles.css";
import { Nav } from "./parksmart-home-main/src/components/park/Nav";
import { Hero } from "./parksmart-home-main/src/components/park/Hero";

import {
  Stats,
  Features,
  LivePreview,
  HowItWorks,
  Testimonials,
} from "./parksmart-home-main/src/components/park/Sections";

import {
  FinalCta,
  Footer,
} from "./parksmart-home-main/src/components/park/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main>
        <Hero />

        <Stats />

        <Features />

        <LivePreview />

        <HowItWorks />

        <Testimonials />

        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}