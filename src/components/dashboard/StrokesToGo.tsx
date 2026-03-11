import { Round } from "@/lib/types";
import { getStrokesToGo } from "@/lib/dashboard";

export default function StrokesToGo({ rounds }: { rounds: Round[] }) {
  const data = getStrokesToGo(rounds);

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-2xl font-bold text-gray-300">No rounds yet</div>
        <div className="mt-1 text-sm text-gray-400">
          Log your first round to start tracking
        </div>
      </div>
    );
  }

  const { strokes, bestScore, date } = data;
  const color =
    strokes <= 0
      ? "text-green-600"
      : strokes <= 5
        ? "text-green-600"
        : strokes <= 10
          ? "text-yellow-500"
          : "text-gray-900";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
      {strokes <= 0 ? (
        <>
          <div className="text-lg font-medium text-gray-500">You did it!</div>
          <div className={`text-7xl font-black ${color}`}>{bestScore}</div>
        </>
      ) : (
        <>
          <div className="text-sm font-medium text-gray-500">Strokes to go</div>
          <div className={`text-7xl font-black ${color}`}>
            {strokes}
          </div>
        </>
      )}
      <div className="mt-2 text-sm text-gray-500">
        Best: {bestScore} on {date}
      </div>
    </div>
  );
}
