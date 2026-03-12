"use client";

import { useState } from "react";
import { Round } from "@/lib/types";

function get18HoleRounds(rounds: Round[]): Round[] {
  return rounds.filter((r) => r.course?.holes !== 9);
}

export default function ScoreTrendChart({ rounds }: { rounds: Round[] }) {
  const sorted = [...get18HoleRounds(rounds)]
    .sort(
      (a, b) =>
        new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
    )
    .slice(-30);

  const [hover, setHover] = useState<number | null>(null);

  if (sorted.length < 2) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Score Trend
        </h2>
        <div className="py-8 text-center text-sm text-gray-400">
          Need at least 2 rounds to show trend
        </div>
      </div>
    );
  }

  const scores = sorted.map((r) => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const padding = Math.max(2, Math.ceil((maxScore - minScore) * 0.1));
  const yMin = minScore - padding;
  const yMax = maxScore + padding;

  const W = 600;
  const H = 200;
  const PL = 40;
  const PR = 16;
  const PT = 16;
  const PB = 32;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  function x(i: number) {
    return PL + (i / (sorted.length - 1)) * chartW;
  }
  function y(score: number) {
    return PT + ((yMax - score) / (yMax - yMin)) * chartH;
  }

  const line = sorted
    .map((r, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(r.score)}`)
    .join(" ");

  // Y-axis labels
  const yTicks: number[] = [];
  const step = maxScore - minScore > 20 ? 5 : maxScore - minScore > 8 ? 2 : 1;
  for (
    let v = Math.ceil(yMin / step) * step;
    v <= Math.floor(yMax / step) * step;
    v += step
  ) {
    yTicks.push(v);
  }

  // Break 80 line
  const show79 = yMin <= 79 && yMax >= 79;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Score Trend (last {sorted.length} rounds)
      </h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PL}
              y1={y(v)}
              x2={W - PR}
              y2={y(v)}
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x={PL - 6}
              y={y(v) + 4}
              textAnchor="end"
              className="fill-gray-400 dark:fill-gray-500"
              fontSize="10"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Break 80 line */}
        {show79 && (
          <g>
            <line
              x1={PL}
              y1={y(79)}
              x2={W - PR}
              y2={y(79)}
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            <text
              x={W - PR + 2}
              y={y(79) + 3}
              fontSize="9"
              className="fill-green-600"
            >
              79
            </text>
          </g>
        )}

        {/* Score line */}
        <path d={line} fill="none" stroke="#111" strokeWidth="2" />

        {/* Data points */}
        {sorted.map((r, i) => (
          <g key={r.id}>
            <circle
              cx={x(i)}
              cy={y(r.score)}
              r={hover === i ? 5 : 3.5}
              fill={r.score < 80 ? "#16a34a" : "#111"}
              stroke="white"
              strokeWidth="1.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            />
            {hover === i && (
              <>
                <rect
                  x={x(i) - 36}
                  y={y(r.score) - 34}
                  width="72"
                  height="22"
                  rx="4"
                  fill="#1f2937"
                />
                <text
                  x={x(i)}
                  y={y(r.score) - 19}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {r.score} · {new Date(r.date_played + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </text>
              </>
            )}
          </g>
        ))}

        {/* X-axis date labels */}
        {[0, Math.floor(sorted.length / 2), sorted.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 4}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize="9"
          >
            {new Date(sorted[i].date_played + "T00:00:00").toLocaleDateString(
              "en-US",
              { month: "short", year: "2-digit" }
            )}
          </text>
        ))}
      </svg>
    </div>
  );
}
