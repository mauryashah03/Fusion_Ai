import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "./HeroDemo";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.35),transparent)]" />
        <div className="absolute left-1/4 top-40 h-[400px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.20),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>The world's first multi-model AI workspace</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          Veriq. <br className="hidden md:block" />
          <span className="gradient-text">Where Verification Meets Intelligence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Compare GPT, Claude, and Gemini instantly — and receive the smartest
          combined answer, scored and synthesized in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth">
              Get Started <ArrowRight className="ml-1" />
            </Link>
          </Button>
          
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          No credit card · 5 free comparisons every day · Cancel anytime
        </motion.p>
      </div>

      <div id="demo" className="mx-auto mt-16 max-w-7xl px-4">
        <HeroDemo />
      </div>
    </section>
  );
}
