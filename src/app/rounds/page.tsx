import { createServerClient } from "@/lib/supabase-server";
import RoundCard from "@/components/RoundCard";
import { Round } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RoundsPage() {
  const supabase = createServerClient();
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*, course:courses(*), tee:tees(*)")
    .order("date_played", { ascending: false });

  const allRounds: Round[] = rounds ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Rounds</h1>
      {allRounds.length === 0 ? (
        <p className="text-gray-400">No rounds yet.</p>
      ) : (
        <div className="space-y-3">
          {allRounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      )}
    </div>
  );
}
