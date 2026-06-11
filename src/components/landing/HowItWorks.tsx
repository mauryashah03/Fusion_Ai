import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Enter Prompt", desc: "Type a question, paste research, or upload a file." },
  { n: "02", title: "AI Models Respond", desc: "GPT, Claude, and Gemini stream answers in parallel." },
  { n: "03", title: "Responses Analyzed", desc: "We score every answer across six quality dimensions." },
  { n: "04", title: "Best Answer Generated", desc: "A merged intelligence answer combines the strongest insights." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Workflow</p>
          <h2 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            From prompt to <span className="gradient-text">verified answer</span>
          </h2>
        </div>

        <div className="relative mt-16 grid gap-5 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px [background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),rgba(6,182,212,0.5),transparent)] md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass relative rounded-2xl p-6 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full [background:var(--gradient-primary)] font-mono text-sm font-bold text-white shadow-lg">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
