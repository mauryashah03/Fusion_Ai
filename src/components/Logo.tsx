import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl [background:var(--gradient-primary)] glow">
        <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-xl bg-white/10 mix-blend-overlay" />
      </div>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Three Minds <span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
}
