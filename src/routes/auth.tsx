import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-store";
import { firebaseEnabled } from "@/lib/firebase";
import { Github, Mail, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Veriq AI" },
      { name: "description", content: "Sign in to your Veriq AI workspace." },
    ],
  }),
  component: AuthPage,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("veriq-auth");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.state?.user) throw redirect({ to: "/dashboard" });
        } catch (e) {
          if (e && typeof e === "object" && "to" in e) throw e;
        }
      }
    }
  },
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Read saved theme from localStorage on first render
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("veriq-theme") as "dark" | "light" | null;
    return saved ?? "light";
  });

  // ✅ Apply theme classes to <html> and <body> whenever theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
  }, [theme]);

  // ✅ Single toggleTheme — inside component, dispatches event to sync Toaster
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("veriq-theme", next);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next }));
    setTheme(next);
  }

  const signInEmail = useAuth((s) => s.signInEmail);
  const signUpEmail = useAuth((s) => s.signUpEmail);
  const signInGoogle = useAuth((s) => s.signInGoogle);
  const signInGithub = useAuth((s) => s.signInGithub);
  const signInDemo = useAuth((s) => s.signInDemo);
  const loading = useAuth((s) => s.loading);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(name, email, password);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  async function social(p: "google" | "github") {
    try {
      if (p === "google") await signInGoogle();
      else await signInGithub();
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    }
  }

  function demo() {
    signInDemo();
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex">
        <Link to="/"><Logo /></Link>
        <div className="relative">
          <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <h2 className="font-display relative max-w-md text-4xl font-bold leading-tight">
            Stop tab-switching between AI tools.
            <span className="gradient-text"> Run them all at once.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Veriq AI sends every prompt to GPT, Claude, and Gemini in parallel — then
            scores, ranks, and merges the answers so you don't have to.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Veriq AI
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-[0_30px_100px_-40px_rgba(124,58,237,0.7)]"
        >
          {/* Top row: Logo (mobile) + Theme toggle */}
          <div className="mb-6 flex items-center justify-between lg:justify-end">
            <div className="lg:hidden"><Logo /></div>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="grid h-8 w-8 place-items-center rounded-full transition-all"
              style={{
                border: "1px solid var(--border)",
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your Veriq AI account."
              : "Spin up a free Veriq AI account in seconds."}
          </p>

          <div className="mt-6 grid gap-2">
            <Button variant="glass" onClick={() => social("google")} disabled={loading}>
              <GoogleIcon /> Continue with Google
            </Button>
            <Button variant="glass" onClick={() => social("github")} disabled={loading}>
              <Github className="h-4 w-4" /> Continue with GitHub
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" /> or email{" "}
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <Mail className="h-4 w-4" />
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="hover:text-foreground"
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have one? Sign in"}
            </button>
            <button onClick={demo} className="hover:text-foreground">
              Try demo →
            </button>
          </div>

          {!firebaseEnabled && (
            <p className="mt-5 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Demo mode:</span> Firebase env
              vars aren't set, so sign-in is local-only and stays on this device. Add{" "}
              <code className="text-primary">VITE_FIREBASE_API_KEY</code> + friends to enable
              real auth.
            </p>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}