"use client";

import { useState } from "react";
import { Round } from "@/lib/types";
import { calculateHandicapHistory } from "@/lib/handicap";

export default function HandicapTrendChart({ rounds }: { rounds: Round[] }) {
  const history = calculateHandicapHistory(rounds);
  const [hover, setHover] = useState<number | null>(null);

  if (history.length < 2) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Handicap Trend
        </h2>
        <div className="py-8 text-center text-sm text-gray-400">
          Need more rounds to show trend
        </div>
      </div>
    );
  }

  const values = history.map((h) => h.handicap);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(1, (maxVal - minVal) * 0.15);
  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  const W = 600;
  const H = 180;
  const PL = 40;
  const PR = 16;
  const PT = 16;
  const PB = 32;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  function x(i: number) {
    return PL + (i / (history.length - 1)) * chartW;
  }
  function y(val: number) {
    return PT + ((yMax - val) / (yMax - yMin)) * chartH;
  }

  const line = history
    .map((h, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(h.handicap)}`)
    .join(" ");

  const step = maxVal - minVal > 10 ? 5 : maxVal - minVal > 4 ? 2 : 1;
  const yTicks: number[] = [];
  for (
    let v = Math.ceil(yMin / step) * step;
    v <= Math.floor(yMax / step) * step;
    v += step
  ) {
    yTicks.push(v);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Handicap Trend
      </h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PL}
              y1={y(v)}
              x2={W - PR}
              y2={y(v)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={PL - 6}
              y={y(v) + 4}
              textAnchor="end"
              className="fill-gray-400 dark:fill-gray-500"
              fontSize="10"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        <path d={line} fill="none" stroke="#16a34a" strokeWidth="2" />

        {history.map((h, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(h.handicap)}
              r={hover === i ? 5 : 3}
              fill="#16a34a"
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
                  y={y(h.handicap) - 34}
                  width="72"
                  height="22"
                  rx="4"
                  fill="#1f2937"
                />
                <text
                  x={x(i)}
                  y={y(h.handicap) - 19}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {h.handicap.toFixed(1)} · {h.date}
                </text>
              </>
            )}
          </g>
        ))}

        {[0, Math.floor(history.length / 2), history.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 4}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize="9"
          >
            {history[i].date}
          </text>
        ))}
      </svg>
    </div>
  );
}
