import { createServerClient } from "@/lib/supabase-server";
import StrokesToGo from "@/components/dashboard/StrokesToGo";
import RollingBest from "@/components/dashboard/RollingBest";
import ScoreDistribution from "@/components/dashboard/ScoreDistribution";
import MilestoneTrail from "@/components/dashboard/MilestoneTrail";
import RoundCard from "@/components/RoundCard";
import { Round } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*, course:courses(*), tee:tees(*)")
    .order("date_played", { ascending: false });

  const allRounds: Round[] = rounds ?? [];
  const recentRounds = allRounds.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          break<span className="text-green-600">80</span>
        </h1>
        <p className="mt-1 text-gray-500">
          Journey of an average golfer trying to break 80.
        </p>
      </div>

      <StrokesToGo rounds={allRounds} />

      <div className="grid gap-6 sm:grid-cols-2">
        <RollingBest rounds={allRounds} />
        <ScoreDistribution rounds={allRounds} />
      </div>

      <MilestoneTrail rounds={allRounds} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Rounds</h2>
        {recentRounds.length === 0 ? (
          <p className="text-gray-400">No rounds yet.</p>
        ) : (
          <div className="space-y-3">
            {recentRounds.map((round) => (
              <RoundCard key={round.id} round={round} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
