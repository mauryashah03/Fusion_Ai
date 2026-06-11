import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try it before you commit.",
    features: ["5 prompts per day", "Compare all three models", "Basic accuracy scoring", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For power users and small teams.",
    features: ["Unlimited prompts", "Advanced analytics dashboard", "Prompt history & search", "Export responses (PDF, JSON)", "Priority model routing"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Built for orgs and governments.",
    features: ["Custom AI routing & policies", "Team workspace & SSO", "Government-grade security", "Dedicated API & SLAs", "On-prem deployment options"],
    cta: "Contact sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you're ready to scale.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={
                t.highlight
                  ? "gradient-border relative rounded-3xl p-8 shadow-[0_30px_100px_-40px_rgba(124,58,237,0.7)]"
                  : "glass relative rounded-3xl p-8"
              }
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full [background:var(--gradient-primary)] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <Button
                variant={t.highlight ? "hero" : "glass"}
                size="lg"
                className="mt-6 w-full"
                asChild
              >
                <Link to="/auth">{t.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
