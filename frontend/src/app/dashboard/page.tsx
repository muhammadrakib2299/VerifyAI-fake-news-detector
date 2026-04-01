"use client";

import { useEffect, useState } from "react";
import { getStats, type StatsResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const VERDICT_COLORS: Record<string, string> = {
  Real: "#22c55e",
  Misleading: "#f59e0b",
  Fake: "#ef4444",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 bg-muted rounded" />
            <div className="h-28 bg-muted rounded" />
            <div className="h-28 bg-muted rounded" />
          </div>
          <div className="h-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Failed to Load Dashboard</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <a href="/">
          <Button>Back to Home</Button>
        </a>
      </div>
    );
  }

  if (!stats) return null;

  // Compute quick stats
  const realCount =
    stats.verdict_distribution.find((v) => v.verdict === "Real")?.count || 0;
  const fakeCount =
    stats.verdict_distribution.find((v) => v.verdict === "Fake")?.count || 0;
  const misleadingCount =
    stats.verdict_distribution.find((v) => v.verdict === "Misleading")?.count ||
    0;

  const pieData = stats.verdict_distribution.map((v) => ({
    name: v.verdict,
    value: v.count,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Analyses"
          value={stats.total_analyses}
          color="text-foreground"
        />
        <StatCard label="Real" value={realCount} color="text-green-600 dark:text-green-400" />
        <StatCard
          label="Misleading"
          value={misleadingCount}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard label="Fake" value={fakeCount} color="text-red-600 dark:text-red-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Verdict Distribution Pie */}
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold mb-4">Verdict Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={VERDICT_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">
              No data yet. Run some analyses first!
            </p>
          )}
        </div>

        {/* Analysis Trends Line Chart */}
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold mb-4">Analysis Trends (30 Days)</h2>
          {stats.trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(d) => {
                    const date = new Date(d);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(d) => {
                    const date = new Date(d);
                    return date.toLocaleDateString();
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Analyses"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">
              No trend data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold mb-4">Recent Analyses</h2>
          {stats.recent_analyses.length > 0 ? (
            <ul className="space-y-3">
              {stats.recent_analyses.map((a) => (
                <li key={a.id}>
                  <a
                    href={`/results/${a.id}`}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{a.input_text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.input_type} &middot;{" "}
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full ${
                        a.verdict === "Real"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                          : a.verdict === "Fake"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                      }`}
                    >
                      {a.verdict}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No analyses yet.
            </p>
          )}
        </div>

        {/* Most Flagged Sources */}
        <div className="rounded-lg border border-border p-5">
          <h2 className="font-semibold mb-4">Most Flagged Sources</h2>
          {stats.flagged_sources.length > 0 ? (
            <ul className="space-y-2">
              {stats.flagged_sources.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-mono">{s.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.count} {s.count === 1 ? "analysis" : "analyses"}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      s.avg_score >= 65
                        ? "text-red-600 dark:text-red-400"
                        : s.avg_score >= 30
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {s.avg_score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No URL analyses yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
