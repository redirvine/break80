"use client";

import { Round } from "@/lib/types";
import { getScoreDistribution } from "@/lib/dashboard";
import { useState } from "react";

export default function ScoreDistribution({ rounds }: { rounds: Round[] }) {
  const bands = getScoreDistribution(rounds);
  const [hover, setHover] = useState<string | null>(null);
  const hasRounds = bands.some((b) => b.count > 0);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">Score Distribution</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {!hasRounds ? (
          <div className="py-4 text-center text-sm text-gray-400">
            No rounds yet
          </div>
        ) : (
          <>
            <div className="flex h-8 overflow-hidden rounded-full">
              {bands
                .filter((b) => b.pct > 0)
                .map((b) => (
                  <div
                    key={b.band}
                    className={`${b.color} relative transition-all`}
                    style={{ width: `${b.pct}%` }}
                    onMouseEnter={() => setHover(b.band)}
                    onMouseLeave={() => setHover(null)}
                  >
                    {hover === b.band && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white">
                        {b.count} ({Math.round(b.pct)}%)
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {bands.map((b) => (
                <div key={b.band} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                  {b.band}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
