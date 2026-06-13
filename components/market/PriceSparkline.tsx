"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparkPoint {
  price: number;
}

interface PriceSparklineProps {
  data: SparkPoint[];
  color?: string;
}

export function PriceSparkline({
  data,
  color = "oklch(0.75 0.15 200)",
}: PriceSparklineProps) {
  if (data.length < 2) {
    return (
      <div className="flex h-10 w-full items-center justify-center font-mono text-[10px] text-muted-foreground">
        —
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.08 0.008 255)",
            border: "1px solid oklch(0.22 0.03 240)",
            borderRadius: "4px",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            padding: "2px 8px",
          }}
          labelStyle={{ display: "none" }}
          formatter={(value) =>
            typeof value === "number"
              ? [`$${value.toLocaleString()}`, "Low"]
              : [value, ""]
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
