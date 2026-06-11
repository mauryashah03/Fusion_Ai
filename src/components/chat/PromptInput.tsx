import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  busy: boolean;
  onSubmit: (prompt: string, mode: "compare" | "merge") => void;
};

export function PromptInput({ busy, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  function handle(mode: "compare" | "merge") {
    const v = value.trim();
    if (!v || busy) return;
    onSubmit(v, mode);
    setValue("");
    taRef.current?.focus();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-3 shadow-[0_20px_60px_-30px_rgba(124,58,237,0.6)]"
    >
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handle("compare");
          }
        }}
        placeholder="Ask GPT, Claude, and Gemini..."
        className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        disabled={busy}
      />
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" disabled={busy} title="Attach (UI only)">
            <Paperclip className="h-4 w-4" />
          </Button>
          <span className="hidden text-xs sm:inline">
            Drag & drop a file · ⌘↵ to compare
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            disabled={busy || !value.trim()}
            onClick={() => handle("merge")}
          >
            <Sparkles className="h-4 w-4" /> Generate Best Answer
          </Button>
          <Button
            variant="hero"
            size="sm"
            disabled={busy || !value.trim()}
            onClick={() => handle("compare")}
          >
            <Send className="h-4 w-4" /> Compare
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
