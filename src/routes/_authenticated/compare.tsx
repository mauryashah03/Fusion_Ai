import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export const Route = createFileRoute("/_authenticated/compare")({
  head: () => ({ meta: [{ title: "AI Compare — Three Minds AI" }] }),
  component: ComparePage,
});

function ComparePage() {
  return (
    <>
      <Topbar title="AI Compare" subtitle="Run frontier models head-to-head" />
      <div className="mx-auto max-w-6xl p-6">
        <ChatWorkspace initialPrompt="Compare React, Vue, and Svelte for an enterprise dashboard." />
      </div>
    </>
  );
}
