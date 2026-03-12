"use client";

import { Round } from "@/lib/types";
import { getMilestones } from "@/lib/dashboard";

export default function Milestones({ rounds }: { rounds: Round[] }) {
  const milestones = getMilestones(rounds);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Milestones</h2>
      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.label}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              m.achieved ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  m.achieved
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-600"
                }`}
              >
                {m.achieved ? "\u2713" : ""}
              </div>
              <div>
                <div
                  className={`font-medium ${
                    m.achieved ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {m.label}
                </div>
                {m.achieved && m.date && (
                  <div className="text-xs text-gray-500">
                    {m.date} &middot; Shot {m.score}
                  </div>
                )}
              </div>
            </div>
            {!m.achieved && (
              <span className="text-xs text-gray-400">Not yet</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
