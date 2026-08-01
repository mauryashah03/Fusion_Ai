import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paperclip,
  Send,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Props = {
  busy: boolean;
  onSubmit: (prompt: string, mode: "compare" | "merge") => void;
};

export function PromptInput({ busy, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    // English + Hindi + Punjabi
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setValue(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }

  function handle(mode: "compare" | "merge") {
    const v = value.trim();

    if (!v || busy) return;

    if (listening) {
      recognitionRef.current?.stop();
    }

    onSubmit(v, mode);
    setValue("");
    taRef.current?.focus();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/20 bg-black/20 backdrop-blur-xl p-3 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.4)]"
    >
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        disabled={busy}
        placeholder="Ask GPT, Claude, Gemini..."
        className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handle("compare");
          }
        }}
      />

      <div className="flex items-center justify-between pt-2">

        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="icon"
            title="Attach"
            disabled={busy}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <span className="hidden sm:block text-xs text-gray-400">
            Enter = Compare • Shift+Enter = New line
          </span>

        </div>

        <div className="flex items-center gap-2">

          {/* MICROPHONE */}

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggleMic}
            disabled={busy}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
            ${
              listening
                ? "bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {listening && (
              <motion.span
                className="absolute h-full w-full rounded-full border border-red-400"
                animate={{
                  scale: [1, 1.7],
                  opacity: [0.8, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.3,
                }}
              />
            )}

            <AnimatePresence mode="wait">
              {listening ? (
                <motion.div
                  key="off"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <MicOff className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="on"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Mic className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <Button
            variant="glass"
            size="sm"
            disabled={busy || !value.trim()}
            onClick={() => handle("merge")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Best Answer
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