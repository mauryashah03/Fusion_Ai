import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "New Chat — Veriq AI" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Topbar title="New Chat" subtitle="Send a prompt to all models in parallel" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <ChatWorkspace />
        </div>
      </div>
    </div>
  );
}