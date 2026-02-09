"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Round } from "@/lib/types";

interface ScoreChartProps {
  rounds: Round[];
}

export default function ScoreChart({ rounds }: ScoreChartProps) {
  const sorted = [...rounds].sort(
    (a, b) =>
      new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
  );

  const data = sorted.map((r) => ({
    date: new Date(r.date_played).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: r.score,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No rounds yet — add your first round to see the chart.
      </div>
    );
  }

  const scores = sorted.map((r) => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const yMin = Math.floor(Math.min(minScore, 78) / 2) * 2;
  const yMax = Math.ceil(Math.max(maxScore, 82) / 2) * 2;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <ReferenceLine
          y={80}
          stroke="#dc2626"
          strokeDasharray="6 4"
          label={{ value: "80", position: "right", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 4, fill: "#16a34a" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
