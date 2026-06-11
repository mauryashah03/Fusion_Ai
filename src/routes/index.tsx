import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { ModelsStrip } from "@/components/landing/ModelsStrip";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Three Minds AI — Ask Once. Get Three Minds." },
      { name: "description", content: "Compare GPT, Claude, and Gemini instantly. Three frontier AI models, one premium workspace, the smartest combined answer." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <Hero />
      <ModelsStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
