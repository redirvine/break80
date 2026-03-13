"use client";

import { Round } from "@/lib/types";

function get18HoleRounds(rounds: Round[]): Round[] {
  return rounds.filter((r) => r.course?.holes !== 9);
}

function avg(values: number[]): string {
  if (values.length === 0) return "---";
  return (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);
}

export default function StatAverages({ rounds }: { rounds: Round[] }) {
  const eligible = get18HoleRounds(rounds);

  const stats = [
    {
      label: "Avg Score",
      value: avg(eligible.map((r) => r.score)),
      sub: `${eligible.length} rounds`,
    },
    {
      label: "Avg Putts",
      value: avg(
        eligible.filter((r) => r.total_putts != null).map((r) => r.total_putts!)
      ),
      sub: `${eligible.filter((r) => r.total_putts != null).length} tracked`,
    },
    {
      label: "Avg GIR",
      value: avg(
        eligible.filter((r) => r.gir != null).map((r) => r.gir!)
      ),
      sub: `${eligible.filter((r) => r.gir != null).length} tracked`,
    },
    {
      label: "Avg Fairways",
      value: avg(
        eligible
          .filter((r) => r.fairways_hit != null)
          .map((r) => r.fairways_hit!)
      ),
      sub: `${eligible.filter((r) => r.fairways_hit != null).length} tracked`,
    },
    {
      label: "Avg Birdies",
      value: avg(
        eligible.filter((r) => r.birdies != null).map((r) => r.birdies!)
      ),
      sub: `${eligible.filter((r) => r.birdies != null).length} tracked`,
    },
    {
      label: "Avg Penalties",
      value: avg(
        eligible.filter((r) => r.penalties != null).map((r) => r.penalties!)
      ),
      sub: `${eligible.filter((r) => r.penalties != null).length} tracked`,
    },
    {
      label: "Scrambling %",
      value: (() => {
        const tracked = eligible.filter(
          (r) => r.scrambles != null && r.gir != null
        );
        if (tracked.length === 0) return "---";
        const totalScrambles = tracked.reduce((s, r) => s + r.scrambles!, 0);
        const totalOpps = tracked.reduce((s, r) => s + (18 - r.gir!), 0);
        if (totalOpps === 0) return "---";
        return ((totalScrambles / totalOpps) * 100).toFixed(0) + "%";
      })(),
      sub: `${eligible.filter((r) => r.scrambles != null && r.gir != null).length} tracked`,
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Averages (18-hole rounds)
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
