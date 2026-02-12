import { createServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { Round } from "@/lib/types";
import Link from "next/link";
import DeleteRoundButton from "@/components/DeleteRoundButton";
import EditRoundLink from "@/components/EditRoundLink";

export const dynamic = "force-dynamic";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("rounds")
    .select("*, course:courses(*), tee:tees(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const round = data as Round;
  const isUnder80 = round.score < 80;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/rounds"
          className="text-sm text-gray-500 hover:text-green-600"
        >
          &larr; Back to rounds
        </Link>
        <div className="flex gap-2">
          <EditRoundLink roundId={round.id} />
          <DeleteRoundButton roundId={round.id} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{round.course_name}</h1>
            <p className="mt-1 text-gray-500">
              {new Date(round.date_played + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {round.transport === "cart" ? "Rode cart" : "Walked"}
            </p>
          </div>
          <div
            className={`text-4xl font-bold ${
              isUnder80 ? "text-green-600" : "text-gray-900"
            }`}
          >
            {round.score}
          </div>
        </div>

        {round.tee && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              Tee Info
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <span className="text-gray-500">Tee:</span>{" "}
                <span className="font-medium">{round.tee.tee_name}</span>
              </div>
              {round.tee.yardage && (
                <div>
                  <span className="text-gray-500">Yardage:</span>{" "}
                  <span className="font-medium">{round.tee.yardage}</span>
                </div>
              )}
              {round.tee.slope && (
                <div>
                  <span className="text-gray-500">Slope:</span>{" "}
                  <span className="font-medium">{round.tee.slope}</span>
                </div>
              )}
              {round.tee.rating && (
                <div>
                  <span className="text-gray-500">Rating:</span>{" "}
                  <span className="font-medium">{round.tee.rating}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(round.gir !== null || round.total_putts !== null || round.penalties !== null) && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              Round Stats
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              {round.gir !== null && (
                <div>
                  <span className="text-gray-500">GIR:</span>{" "}
                  <span className="font-medium">{round.gir}</span>
                </div>
              )}
              {round.total_putts !== null && (
                <div>
                  <span className="text-gray-500">Total Putts:</span>{" "}
                  <span className="font-medium">{round.total_putts}</span>
                </div>
              )}
              {round.penalties !== null && (
                <div>
                  <span className="text-gray-500">Penalties:</span>{" "}
                  <span className="font-medium">{round.penalties}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {round.notes && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-500">Notes</h2>
            <p className="whitespace-pre-wrap text-gray-700">{round.notes}</p>
          </div>
        )}

        {round.image_url && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              Scorecard
            </h2>
            <img
              src={round.image_url}
              alt={`Scorecard from ${round.course_name}`}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
