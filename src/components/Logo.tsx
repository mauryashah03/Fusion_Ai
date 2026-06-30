import { cn } from "@/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl glow">
        <img src="C:\Users\Gurleen\OneDrive\Desktop\Fusion_Ai\public\logo.png" alt="Veriq AI logo" className="h-full w-full object-cover" />
      </div>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Veriq <span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
}