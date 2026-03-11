import { Round } from "@/lib/types";
import { getStrokesToGo } from "@/lib/dashboard";

export default function StrokesToGo({ rounds }: { rounds: Round[] }) {
  const data = getStrokesToGo(rounds);

  const color =
    !data || data.strokes > 10
      ? "text-gray-900"
      : data.strokes <= 0
        ? "text-green-600"
        : data.strokes <= 5
          ? "text-green-600"
          : "text-yellow-500";

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">Strokes to Go</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
        {!data ? (
          <div className="py-2 text-sm text-gray-400">No rounds yet</div>
        ) : data.strokes <= 0 ? (
          <>
            <div className={`text-3xl font-black ${color}`}>Done!</div>
            <div className="mt-1 text-xs text-gray-500">
              Shot {data.bestScore} on {data.date}
            </div>
          </>
        ) : (
          <>
            <div className={`text-3xl font-black ${color}`}>{data.strokes}</div>
            <div className="mt-1 text-xs text-gray-500">
              Best: {data.bestScore} on {data.date}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
