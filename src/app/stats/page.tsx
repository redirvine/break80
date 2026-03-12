import { createServerClient } from "@/lib/supabase-server";
import { Round } from "@/lib/types";
import HandicapCard from "@/components/stats/HandicapCard";
import ScoreTrendChart from "@/components/stats/ScoreTrendChart";
import HandicapTrendChart from "@/components/stats/HandicapTrendChart";
import PerCourseBreakdown from "@/components/stats/PerCourseBreakdown";
import StatAverages from "@/components/stats/StatAverages";
import Milestones from "@/components/stats/Milestones";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = createServerClient();
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*, course:courses(*), tee:tees(*)")
    .order("date_played", { ascending: false });

  const allRounds: Round[] = rounds ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <HandicapCard rounds={allRounds} />
        <StatAverages rounds={allRounds} />
      </div>

      <ScoreTrendChart rounds={allRounds} />
      <HandicapTrendChart rounds={allRounds} />
      <PerCourseBreakdown rounds={allRounds} />
      <Milestones rounds={allRounds} />
    </div>
  );
}
