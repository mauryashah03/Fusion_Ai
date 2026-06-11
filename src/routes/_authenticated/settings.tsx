import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Download, Key, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Three Minds AI" }] }),
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
  const history = useChat((s) => s.history);
  const clearHistory = useChat((s) => s.clearHistory);

  function exportData() {
    const blob = new Blob([JSON.stringify({ user, history }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "threeminds-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  }

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

        <Section title="Theme" desc="Dark by default. Light mode coming soon.">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <span className="text-sm">Dark mode</span>
            <Switch defaultChecked disabled />
          </div>
        </Section>

        <Section title="API Keys" desc="Bring your own keys to unlock real-model calls.">
          <div className="space-y-3">
            {["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_AI_KEY"].map((k) => (
              <div key={k} className="space-y-1">
                <Label className="flex items-center gap-2"><Key className="h-3 w-3" /> {k}</Label>
                <Input type="password" placeholder="sk-•••••••••••" />
              </div>
            ))}
            <Button variant="glass" size="sm" onClick={() => toast.info("Saved locally only (demo)")}>Save keys</Button>
          </div>
        </Section>

        <Section title="Notifications">
          <div className="space-y-2">
            {[
              ["Email me when a comparison finishes", true],
              ["Weekly usage digest", true],
              ["Product announcements", false],
            ].map(([label, on]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm">
                <span>{label}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Language">
          <select className="glass w-full rounded-xl bg-transparent px-4 py-2.5 text-sm outline-none">
            <option className="bg-card">English</option>
            <option className="bg-card">French</option>
            <option className="bg-card">Spanish</option>
            <option className="bg-card">German</option>
            <option className="bg-card">Japanese</option>
          </select>
        </Section>

        <Section title="Billing" desc="Current plan: Pro · $29/mo">
          <Button variant="hero" size="sm">Manage subscription</Button>
        </Section>

        <Section title="Export & Danger Zone" desc="Your data, your rights.">
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" size="sm" onClick={exportData}>
              <Download className="h-4 w-4" /> Export data
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { clearHistory(); toast.success("History cleared"); }}>
              <Trash2 className="h-4 w-4" /> Clear history
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
