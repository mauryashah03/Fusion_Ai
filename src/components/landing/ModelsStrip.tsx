import { MODELS } from "@/lib/ai-models";

export function ModelsStrip() {
  return (
    <section id="models" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Available today · More dropping soon
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {MODELS.map((m) => (
            <div
              key={m.id}
              className={
                "glass flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all " +
                (m.enabled ? "" : "opacity-50")
              }
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: m.color }}
              />
              <span className="font-medium">{m.name}</span>
              <span className="text-xs text-muted-foreground">· {m.provider}</span>
              {m.comingSoon && (
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
