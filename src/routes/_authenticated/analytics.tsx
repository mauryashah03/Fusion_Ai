import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { modelUsage, qualityTrends } from "@/lib/analytics-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Veriq AI" }] }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["#7C3AED", "#4F46E5", "#06B6D4", "#22C55E", "#F59E0B", "#EC4899", "#94A3B8"];

function getCssVar(variable: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function Card({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={"glass rounded-2xl p-5 " + (span === 2 ? "md:col-span-2" : "")}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

function AnalyticsPage() {
  const axisColor = getCssVar("--axis-color") || "#888888";
  const borderColor = getCssVar("--border") || "rgba(128,128,128,0.2)";

  return (
    <>
      <Topbar title="Analytics" subtitle="Usage, quality, and model trends" />
      <div className="grid gap-4 p-6 md:grid-cols-2">

        <Card title="Model usage">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={modelUsage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {modelUsage.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Response quality trends" span={2}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityTrends}>
              <CartesianGrid stroke={borderColor} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
              />
              <YAxis
                domain={[70, 100]}
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="gpt" stroke="#22C55E" strokeWidth={2} dot={false} name="GPT" />
              <Line type="monotone" dataKey="claude" stroke="#F59E0B" strokeWidth={2} dot={false} name="Claude" />
              <Line type="monotone" dataKey="gemini" stroke="#4F46E5" strokeWidth={2} dot={false} name="Gemini" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </>
  );
}