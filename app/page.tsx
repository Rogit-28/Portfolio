import { Container } from "@/components/layout/container";
import { Hero } from "@/components/sections/hero";
import { Bio } from "@/components/sections/bio";
import { Skills } from "@/components/sections/skills";
import { Research } from "@/components/sections/research";

export default function Home() {
  return (
    <Container className="py-8">
      <Hero />
      <Bio />
      <Skills />
      <Research />
    </Container>
  );
}
