import { Round } from "./types";

function get18HoleRounds(rounds: Round[]): Round[] {
  return rounds.filter((r) => r.course?.holes !== 9);
}

export function getStrokesToGo(
  rounds: Round[]
): { strokes: number; bestScore: number; date: string } | null {
  const eligible = get18HoleRounds(rounds);
  if (eligible.length === 0) return null;

  let best = eligible[0];
  for (const r of eligible) {
    if (r.score < best.score) best = r;
  }

  return {
    strokes: best.score - 80,
    bestScore: best.score,
    date: new Date(best.date_played).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function getRollingBest(
  rounds: Round[]
): { last5: number | null; last10: number | null; last20: number | null } {
  const sorted = [...get18HoleRounds(rounds)].sort(
    (a, b) =>
      new Date(b.date_played).getTime() - new Date(a.date_played).getTime()
  );

  const bestOf = (n: number) => {
    if (sorted.length < n) return null;
    return Math.min(...sorted.slice(0, n).map((r) => r.score));
  };

  return { last5: bestOf(5), last10: bestOf(10), last20: bestOf(20) };
}

interface DistBand {
  band: string;
  count: number;
  pct: number;
  color: string;
}

export function getScoreDistribution(rounds: Round[]): DistBand[] {
  const eligible = get18HoleRounds(rounds);
  const total = eligible.length;

  const bands: { band: string; max: number; min: number; color: string }[] = [
    { band: "<80", min: -Infinity, max: 79, color: "bg-green-600" },
    { band: "80-84", min: 80, max: 84, color: "bg-green-400" },
    { band: "85-89", min: 85, max: 89, color: "bg-yellow-400" },
    { band: "90-94", min: 90, max: 94, color: "bg-orange-400" },
    { band: "95+", min: 95, max: Infinity, color: "bg-red-400" },
  ];

  return bands.map(({ band, min, max, color }) => {
    const count = eligible.filter(
      (r) => r.score >= min && r.score <= max
    ).length;
    return { band, count, pct: total > 0 ? (count / total) * 100 : 0, color };
  });
}

interface Milestone {
  label: string;
  achieved: boolean;
  date: string | null;
  score: number | null;
}

export function getMilestones(rounds: Round[]): Milestone[] {
  const sorted = [...get18HoleRounds(rounds)].sort(
    (a, b) =>
      new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
  );

  const thresholds = [100, 95, 90, 85, 80];
  const milestones: Milestone[] = thresholds.map((t) => {
    const first = sorted.find((r) => r.score < t);
    return {
      label: t === 80 ? "Break 80!" : `Broke ${t}`,
      achieved: !!first,
      date: first
        ? new Date(first.date_played).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      score: first ? first.score : null,
    };
  });

  return milestones;
}
