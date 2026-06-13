"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { StatSnapshot } from "@/lib/generated/prisma/client";

interface ChartPoint {
  date: string;
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
}

function toChartData(snapshots: StatSnapshot[]): ChartPoint[] {
  return [...snapshots]
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .map((s) => ({
      date: new Date(s.takenAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      strength: s.strength,
      defense: s.defense,
      speed: s.speed,
      dexterity: s.dexterity,
    }));
}

const LINES = [
  { key: "strength",  label: "Strength",  color: "oklch(0.75 0.15 200)" },   // cyan
  { key: "defense",   label: "Defense",   color: "oklch(0.65 0.19 300)" },   // purple
  { key: "speed",     label: "Speed",     color: "oklch(0.75 0.16 65)" },    // amber
  { key: "dexterity", label: "Dexterity", color: "oklch(0.72 0.17 160)" },   // green
] as const;

interface StatGrowthChartProps {
  snapshots: StatSnapshot[];
}

export function StatGrowthChart({ snapshots }: StatGrowthChartProps) {
  if (snapshots.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
        <p className="font-mono text-sm text-muted-foreground">
          No snapshot data yet. Visit this page to trigger the first snapshot.
        </p>
      </div>
    );
  }

  const data = toChartData(snapshots);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.22 0.03 240)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "oklch(0.55 0.04 248)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          width={60}
          tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "oklch(0.55 0.04 248)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
            : String(v)
          }
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.08 0.008 255)",
            border: "1px solid oklch(0.22 0.03 240)",
            borderRadius: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
          labelStyle={{ color: "oklch(0.96 0.005 240)", marginBottom: 4 }}
          itemStyle={{ color: "oklch(0.96 0.005 240)" }}
          formatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
        />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
        />
        {LINES.map(({ key, label, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={snapshots.length <= 15}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
