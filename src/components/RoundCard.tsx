"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Round } from "@/lib/types";

interface RoundCardProps {
  round: Round;
}

export default function RoundCard({ round }: RoundCardProps) {
  const { user } = useAuth();
  const isUnder80 = round.score < 80;

  return (
    <Link
      href={`/rounds/${round.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">
            {round.course_name}
            {round.tee && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                {round.tee.tee_name}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(round.date_played + "T00:00:00").toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
            <span className="ml-2 text-gray-400">
              · {round.transport === "cart" ? "Cart" : "Walk"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <Link
              href={`/rounds/${round.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="rounded border border-green-600 px-2 py-0.5 text-xs font-medium text-green-600 hover:bg-green-50"
            >
              Edit
            </Link>
          )}
          <div
            className={`text-2xl font-bold ${
              isUnder80 ? "text-green-600" : "text-gray-900"
            }`}
          >
            {round.score}
          </div>
        </div>
      </div>
      {round.tee && (
        <div className="mt-2 flex gap-4 text-xs text-gray-400">
          {round.tee.yardage && <span>{round.tee.yardage} yds</span>}
          {round.tee.par && <span>Par {round.tee.par}</span>}
          {round.tee.slope && <span>Slope {round.tee.slope}</span>}
          {round.tee.rating && <span>Rating {round.tee.rating}</span>}
        </div>
      )}
      {round.notes && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {round.notes}
        </p>
      )}
    </Link>
  );
}
