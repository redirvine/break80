"use client";

import { Round } from "@/lib/types";

interface CourseStats {
  name: string;
  rounds: number;
  best: number;
  avg: number;
  latest: number;
}

function get18HoleRounds(rounds: Round[]): Round[] {
  return rounds.filter((r) => r.course?.holes !== 9);
}

export default function PerCourseBreakdown({ rounds }: { rounds: Round[] }) {
  const eligible = get18HoleRounds(rounds);

  const byName = new Map<string, Round[]>();
  for (const r of eligible) {
    const existing = byName.get(r.course_name) ?? [];
    existing.push(r);
    byName.set(r.course_name, existing);
  }

  const stats: CourseStats[] = [];
  for (const [name, courseRounds] of byName) {
    const scores = courseRounds.map((r) => r.score);
    const sorted = [...courseRounds].sort(
      (a, b) =>
        new Date(b.date_played).getTime() - new Date(a.date_played).getTime()
    );
    stats.push({
      name,
      rounds: courseRounds.length,
      best: Math.min(...scores),
      avg: Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
      latest: sorted[0].score,
    });
  }

  stats.sort((a, b) => b.rounds - a.rounds);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        Per-Course Breakdown
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
              <th className="pb-2 pr-4">Course</th>
              <th className="pb-2 px-2 text-right">Rounds</th>
              <th className="pb-2 px-2 text-right">Best</th>
              <th className="pb-2 px-2 text-right">Avg</th>
              <th className="pb-2 pl-2 text-right">Latest</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.name} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium">{s.name}</td>
                <td className="py-2 px-2 text-right text-gray-500">
                  {s.rounds}
                </td>
                <td
                  className={`py-2 px-2 text-right font-bold ${
                    s.best < 80 ? "text-green-600" : ""
                  }`}
                >
                  {s.best}
                </td>
                <td className="py-2 px-2 text-right text-gray-600">
                  {s.avg.toFixed(1)}
                </td>
                <td
                  className={`py-2 pl-2 text-right ${
                    s.latest < 80 ? "text-green-600 font-bold" : "text-gray-600"
                  }`}
                >
                  {s.latest}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
