import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Send, Square, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  busy: boolean;
  paused: boolean;
  onSubmit: (prompt: string, mode: "compare" | "merge") => void;
  onToggleStop?: () => void;
};

export function PromptInput({ busy, paused, onSubmit, onToggleStop }: Props) {
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
      className="rounded-xl border border-white/10 bg-transparent p-2 shadow-[0_20px_60px_-30px_rgba(124,58,237,0.6)]"
    >
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handle("compare");
          }
        }}
        placeholder="Ask Gpt, Gemini, and Llama3..."
        className="w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        disabled={busy}
      />
      <div className="flex items-center justify-between gap-2 pt-1.5">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" disabled={busy} title="Attach (UI only)">
            <Paperclip className="h-4 w-4" />
          </Button>
          <span className="hidden text-xs sm:inline">
            Press Enter to compare • Shift+Enter for new line
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Permanent Stop/Resume button — always visible in the bar.
              Disabled when nothing is generating; toggles pause <-> resume
              on the in-flight response while busy. */}
          <Button
            variant={paused ? "glass" : "destructive"}
            size="sm"
            disabled={!busy}
            onClick={onToggleStop}
            title={paused ? "Resume response" : "Stop response"}
          >
            {paused ? (
              <>
                <Play className="h-4 w-4 fill-current" /> Resume
              </>
            ) : (
              <>
                <Square className="h-4 w-4 fill-current" /> Stop
              </>
            )}
          </Button>
          <Button
            variant="hero"
            size="sm"
            disabled={busy || !value.trim()}
            onClick={() => handle("compare")}
          >
            <Send className="h-4 w-4" /> 
          </Button>
        </div>
      </div>
    </motion.div>
  );
}