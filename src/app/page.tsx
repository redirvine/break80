import { createServerClient } from "@/lib/supabase-server";
import RollingBest from "@/components/dashboard/RollingBest";
import ScoreDistribution from "@/components/dashboard/ScoreDistribution";
import RoundsMasterDetail from "@/components/dashboard/RoundsMasterDetail";
import { Round } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*, course:courses(*), tee:tees(*)")
    .order("date_played", { ascending: false });

  const allRounds: Round[] = rounds ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <RollingBest rounds={allRounds} />
        <div className="sm:col-span-2">
          <ScoreDistribution rounds={allRounds} />
        </div>
      </div>

      <RoundsMasterDetail rounds={allRounds} />
    </div>
  );
}
