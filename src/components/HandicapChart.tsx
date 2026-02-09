"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Round } from "@/lib/types";
import { calculateHandicapHistory } from "@/lib/handicap";

interface HandicapChartProps {
  rounds: Round[];
}

export default function HandicapChart({ rounds }: HandicapChartProps) {
  const data = calculateHandicapHistory(rounds);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Not enough rounds with tee data to calculate handicap.
      </div>
    );
  }

  const handicaps = data.map((d) => d.handicap);
  const minH = Math.min(...handicaps);
  const maxH = Math.max(...handicaps);
  const yMin = Math.floor(minH - 1);
  const yMax = Math.ceil(maxH + 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="handicap"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 4, fill: "#2563eb" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
