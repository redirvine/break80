import { Round } from "./types";

export function calculateDifferential(
  score: number,
  slope: number,
  rating: number
): number {
  return (113 / slope) * (score - rating);
}

function combine9HoleRounds(rounds: Round[]): Round[] {
  const nineHoleRounds = rounds.filter(
    (r) =>
      r.course?.holes === 9 &&
      r.tee?.slope != null &&
      r.tee?.rating != null
  );

  const byDate = new Map<string, Round[]>();
  for (const r of nineHoleRounds) {
    const existing = byDate.get(r.date_played) ?? [];
    existing.push(r);
    byDate.set(r.date_played, existing);
  }

  const combined: Round[] = [];
  for (const [, dayRounds] of byDate) {
    for (let i = 0; i + 1 < dayRounds.length; i += 2) {
      const a = dayRounds[i];
      const b = dayRounds[i + 1];
      combined.push({
        ...a,
        score: a.score + b.score,
        tee: {
          ...a.tee!,
          rating: a.tee!.rating! + b.tee!.rating!,
          slope: Math.round((a.tee!.slope! + b.tee!.slope!) / 2),
          par:
            a.tee!.par != null && b.tee!.par != null
              ? a.tee!.par + b.tee!.par
              : null,
        },
        course: { ...a.course!, holes: 18 as const },
      });
    }
  }
  return combined;
}

export function getEligibleRounds(rounds: Round[]): Round[] {
  const eighteenHole = rounds.filter(
    (r) => r.tee?.slope != null && r.tee?.rating != null && r.course?.holes !== 9
  );
  const paired = combine9HoleRounds(rounds);

  return [...eighteenHole, ...paired].sort(
    (a, b) =>
      new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
  );
}

export function getSelectionParams(count: number): {
  best: number;
  adjustment: number;
} | null {
  if (count < 3) return null;
  if (count === 3) return { best: 1, adjustment: -2.0 };
  if (count === 4) return { best: 1, adjustment: -1.0 };
  if (count === 5) return { best: 1, adjustment: 0 };
  if (count === 6) return { best: 2, adjustment: -1.0 };
  if (count <= 8) return { best: 2, adjustment: 0 };
  if (count <= 11) return { best: 3, adjustment: 0 };
  if (count <= 14) return { best: 4, adjustment: 0 };
  if (count <= 16) return { best: 5, adjustment: 0 };
  if (count <= 18) return { best: 6, adjustment: 0 };
  if (count === 19) return { best: 7, adjustment: 0 };
  return { best: 8, adjustment: 0 };
}

export function calculateHandicapIndex(rounds: Round[]): number | null {
  const eligible = getEligibleRounds(rounds);
  const recent = eligible.slice(-20);
  const params = getSelectionParams(recent.length);
  if (!params) return null;

  const differentials = recent
    .map((r) =>
      calculateDifferential(r.score, r.tee!.slope!, r.tee!.rating!)
    )
    .sort((a, b) => a - b);

  const bestDiffs = differentials.slice(0, params.best);
  const avg = bestDiffs.reduce((sum, d) => sum + d, 0) / bestDiffs.length;
  const index = avg + params.adjustment;
  return Math.trunc(index * 10) / 10;
}

export function calculateHandicapHistory(
  rounds: Round[]
): { date: string; handicap: number }[] {
  const eligible = getEligibleRounds(rounds);
  const history: { date: string; handicap: number }[] = [];

  for (let i = 0; i < eligible.length; i++) {
    const windowRounds = eligible.slice(0, i + 1);
    const recent = windowRounds.slice(-20);
    const params = getSelectionParams(recent.length);
    if (!params) continue;

    const differentials = recent
      .map((r) =>
        calculateDifferential(r.score, r.tee!.slope!, r.tee!.rating!)
      )
      .sort((a, b) => a - b);

    const bestDiffs = differentials.slice(0, params.best);
    const avg = bestDiffs.reduce((sum, d) => sum + d, 0) / bestDiffs.length;
    const index = avg + params.adjustment;

    history.push({
      date: new Date(eligible[i].date_played).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      handicap: Math.trunc(index * 10) / 10,
    });
  }

  return history;
}
