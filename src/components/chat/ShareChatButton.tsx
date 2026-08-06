import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useShareChat } from "@/lib/share-store";
import { createShareLink } from "@/lib/share-link";

export function ShareChatButton() {
  const { prompt, responses, merged } = useShareChat();
  const hasContent = Boolean(prompt) && responses.length > 0;
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (!hasContent) {
      toast.info("Start a chat before sharing.");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const url = await createShareLink({
        prompt,
        responses,
        merged,
        createdAt: Date.now(),
      });

      // Use the native Web Share API when available (mobile / supported browsers)
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: "Veriq AI Chat", url });
          return;
        } catch {
          // User cancelled or share failed — fall through to clipboard copy
        }
      }

      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Couldn't create a share link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this chat"
      disabled={loading}
      className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{ background: "var(--gradient-primary)" }}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      <span>{loading ? "Sharing…" : "Share"}</span>
    </button>
  );
}