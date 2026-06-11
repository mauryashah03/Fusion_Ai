import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "New Chat — Three Minds AI" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <>
      <Topbar title="New Chat" subtitle="Send a prompt to all models in parallel" />
      <div className="mx-auto max-w-6xl p-6">
        <ChatWorkspace />
      </div>
    </>
  );
}
