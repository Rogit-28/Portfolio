import { Container } from "@/components/layout/container";
import { Hero } from "@/components/sections/hero";
import { Bio } from "@/components/sections/bio";
import { Skills } from "@/components/sections/skills";
import { Research } from "@/components/sections/research";

export default function Home() {
  return (
    <>
      {/* Hero is full-width, outside container */}
      <Hero />

      {/* Rest of content in container */}
      <Container className="pt-8 pb-16">
        <section id="about" className="scroll-mt-20">
          <Bio />
        </section>
        <Skills />
        <Research />
      </Container>
    </>
  );
}
