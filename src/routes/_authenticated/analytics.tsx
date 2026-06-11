import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { dailyUsage, modelUsage, qualityTrends, categoryDistribution } from "@/lib/analytics-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Three Minds AI" }] }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["#7C3AED", "#4F46E5", "#06B6D4", "#22C55E", "#F59E0B", "#EC4899", "#94A3B8"];

function Card({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={"glass rounded-2xl p-5 " + (span === 2 ? "md:col-span-2" : "")}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <>
      <Topbar title="Analytics" subtitle="Usage, quality, and model trends" />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        <Card title="Daily usage" span={2}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyUsage}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={{ background: "rgba(20,18,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="prompts" stroke="#7C3AED" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="responses" stroke="#06B6D4" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Model usage">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={modelUsage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {modelUsage.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(20,18,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Prompt categories">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDistribution}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(20,18,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Bar dataKey="value" fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Response quality trends" span={2}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityTrends}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(20,18,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
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
