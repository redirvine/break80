import { Round } from "@/lib/types";
import { calculateHandicapIndex } from "@/lib/handicap";

interface StatsBarProps {
  rounds: Round[];
}

export default function StatsBar({ rounds }: StatsBarProps) {
  const count = rounds.length;
  const best = count > 0 ? Math.min(...rounds.map((r) => r.score)) : null;
  const avg =
    count > 0
      ? (rounds.reduce((sum, r) => sum + r.score, 0) / count).toFixed(1)
      : null;
  const sorted = [...rounds].sort(
    (a, b) =>
      new Date(b.date_played).getTime() - new Date(a.date_played).getTime()
  );
  const latest = sorted.length > 0 ? sorted[0].score : null;
  const handicap = calculateHandicapIndex(rounds);

  const roundsWithPar = rounds.filter((r) => r.tee?.par);
  const avgVsPar =
    roundsWithPar.length > 0
      ? (
          roundsWithPar.reduce((sum, r) => sum + (r.score - r.tee!.par!), 0) /
          roundsWithPar.length
        ).toFixed(1)
      : null;
  const avgVsParDisplay =
    avgVsPar !== null
      ? Number(avgVsPar) > 0
        ? `+${avgVsPar}`
        : avgVsPar
      : null;

  const walkRounds = rounds.filter((r) => r.transport === "walk");
  const cartRounds = rounds.filter((r) => r.transport === "cart");
  const walkAvg =
    walkRounds.length > 0
      ? (walkRounds.reduce((sum, r) => sum + r.score, 0) / walkRounds.length).toFixed(1)
      : null;
  const cartAvg =
    cartRounds.length > 0
      ? (cartRounds.reduce((sum, r) => sum + r.score, 0) / cartRounds.length).toFixed(1)
      : null;

  const stats = [
    { label: "Rounds Played", value: count },
    { label: "Best Score", value: best ?? "—" },
    { label: "Average", value: avg ?? "—" },
    { label: "Latest", value: latest ?? "—" },
    { label: "Handicap", value: handicap !== null ? handicap.toFixed(1) : "—" },
    { label: `Avg vs Par (${roundsWithPar.length})`, value: avgVsParDisplay ?? "—" },
    { label: `Walk Avg (${walkRounds.length})`, value: walkAvg ?? "—" },
    { label: `Cart Avg (${cartRounds.length})`, value: cartAvg ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center"
        >
          <div className="text-2xl font-bold">{s.value}</div>
          <div className="mt-1 text-xs text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
