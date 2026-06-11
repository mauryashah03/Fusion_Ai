import ReactMarkdown from "react-markdown";
import { Copy, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MergedAnswer({ text }: { text: string }) {
  if (!text) return null;

  function copy() {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function exportMd() {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged-answer.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gradient-border relative overflow-hidden rounded-2xl p-6 shadow-[0_20px_80px_-30px_rgba(124,58,237,0.7)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl [background:var(--gradient-primary)] glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Merged Intelligence Answer</h3>
              <p className="text-xs text-muted-foreground">Best facts · Best reasoning · Best structure</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={copy}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
            <Button variant="glass" size="sm" onClick={exportMd}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
