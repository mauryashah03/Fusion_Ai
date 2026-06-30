import { motion } from "framer-motion";
import { Layers, Gauge, Sparkles, Briefcase, Shield, Zap } from "lucide-react";

const features = [
  { icon: Layers, title: "Multi-AI Comparison", desc: "Ask once, get answers from GPT, Claude, and Gemini side-by-side in real time." },
  { icon: Gauge, title: "Accuracy Scoring", desc: "Every response is evaluated across six dimensions — accuracy, reasoning, clarity, and more." },
  { icon: Sparkles, title: "Merged Intelligence", desc: "We synthesize the best facts, reasoning, and structure into one unified answer." },
  { icon: Briefcase, title: "Research Workspace", desc: "Built for developers, researchers, enterprises, and government teams." },
  { icon: Shield, title: "Enterprise Security", desc: "Government-grade encryption, SSO, audit logs, and data residency controls." },
  { icon: Zap, title: "Future-Ready", desc: "DeepSeek, Grok, Mistral, Llama, Perplexity, and custom models — one prompt away." },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Capabilities</p>
          <h2 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            One workspace. <span className="gradient-text">Every frontier model.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop tab-switching between AI tools. Veriq AI runs them in parallel and
            picks the winner — so you stop guessing which one to trust.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(124,58,237,0.5)]"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl [background:var(--gradient-primary)] shadow-lg">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
