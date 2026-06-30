import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Veriq AI" }] }),
  component: SettingsPage,
});

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold">{title}</h3>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const user = useAuth((s) => s.user)!;
  const clearHistory = useChat((s) => s.clearHistory);

  return (
    <>
      <Topbar title="Settings" subtitle="Profile, preferences, and data" />
      <div className="grid gap-4 p-6 lg:grid-cols-2">

        <Section title="Profile" desc="How you appear in your workspace.">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input defaultValue={user.name} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input defaultValue={user.email} disabled />
            </div>
            <Button variant="hero" size="sm" onClick={() => toast.success("Profile saved")}>Save changes</Button>
          </div>
        </Section>

        <Section title="Billing" desc="Current plan: Pro · $29/mo">
          <Button variant="hero" size="sm">Manage subscription</Button>
        </Section>

        <Section title="Danger Zone" desc="Your data, your rights.">
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" onClick={() => { clearHistory(); toast.success("History cleared"); }}>
              <Trash2 className="h-4 w-4" /> Clear history
            </Button>
          </div>
        </Section>

      </div>
    </>
  );
}