"use client";

import { Round } from "@/lib/types";
import { calculateHandicapIndex } from "@/lib/handicap";

export default function HandicapCard({ rounds }: { rounds: Round[] }) {
  const index = calculateHandicapIndex(rounds);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
      <div className="text-sm font-semibold text-gray-500">Handicap Index</div>
      <div className="mt-2 text-4xl font-bold text-green-600">
        {index !== null ? index.toFixed(1) : "---"}
      </div>
      {index === null && (
        <div className="mt-2 text-xs text-gray-400">
          Need at least 3 eligible rounds
        </div>
      )}
    </div>
  );
}
