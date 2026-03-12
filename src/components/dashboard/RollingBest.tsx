import { Round } from "@/lib/types";
import { getRollingBest } from "@/lib/dashboard";

export default function RollingBest({ rounds }: { rounds: Round[] }) {
  const { last5, last10, last20 } = getRollingBest(rounds);

  const windows = [
    { label: "Last 5", value: last5 },
    { label: "Last 10", value: last10 },
    { label: "Last 20", value: last20 },
  ];

  const values = windows.map((w) => w.value).filter((v): v is number => v !== null);
  const best = values.length > 0 ? Math.min(...values) : null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rolling Best</h2>
      <div className="grid grid-cols-3 gap-3">
        {windows.map((w) => (
          <div
            key={w.label}
            className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800"
          >
            <div
              className={`text-2xl font-bold ${
                w.value !== null && w.value === best
                  ? "text-green-600"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {w.value ?? "---"}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
