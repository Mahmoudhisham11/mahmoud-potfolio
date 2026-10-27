import { Providers } from "@/components/providers";
import Boot from "@/components/Boot";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Band from "@/components/Band";
import Work from "@/components/Work";
import About from "@/components/About";
import Services from "@/components/Services";
import Journey from "@/components/Journey";
import Terminal from "@/components/Terminal";
import Contact from "@/components/Contact";
import Keys from "@/components/Keys";

export default function Home() {
  return (
    <Providers>
      <Boot />
      <Cursor />
      <Nav />
      <Keys />
      <main>
        <Hero />
        <Band />
        <Work />
        <About />
        <Services />
        <Journey />
        <Terminal />
      </main>
      <Contact />
    </Providers>
  );
}
