import { Round } from "@/lib/types";
import { getMilestones } from "@/lib/dashboard";

export default function MilestoneTrail({ rounds }: { rounds: Round[] }) {
  const milestones = getMilestones(rounds);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">Milestone Trail</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative space-y-0">
          {milestones.map((m, i) => (
            <div key={m.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`z-10 h-4 w-4 rounded-full border-2 ${
                    m.achieved
                      ? "border-green-600 bg-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                />
                {i < milestones.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 ${
                      m.achieved ? "bg-green-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className={`pb-6 ${!m.achieved ? "opacity-40" : ""}`}>
                <div
                  className={`text-sm font-semibold ${
                    m.achieved ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {m.label}
                </div>
                {m.achieved ? (
                  <div className="text-xs text-gray-500">
                    Shot {m.score} on {m.date}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">Not yet</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
