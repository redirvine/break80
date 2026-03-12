"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Round } from "@/lib/types";

type SortKey = "date" | "score" | "course";
type SortDir = "asc" | "desc";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function vsParDisplay(round: Round) {
  const par = round.tee?.par;
  if (!par) return null;
  const diff = round.score - par;
  return diff > 0 ? `+${diff}` : diff === 0 ? "E" : `${diff}`;
}

function vsParColor(round: Round) {
  const par = round.tee?.par;
  if (!par) return "";
  const diff = round.score - par;
  return diff < 0 ? "text-green-600" : diff > 0 ? "text-red-500" : "text-gray-500 dark:text-gray-400";
}

export default function RoundsMasterDetail({ rounds }: { rounds: Round[] }) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(
    rounds.length > 0 ? rounds[0].id : null
  );
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "course" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const copy = [...rounds];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = a.date_played.localeCompare(b.date_played);
      } else if (sortKey === "score") {
        cmp = a.score - b.score;
      } else {
        cmp = a.course_name.localeCompare(b.course_name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rounds, sortKey, sortDir]);

  const selected = rounds.find((r) => r.id === selectedId) ?? null;
  const currentIndex = sorted.findIndex((r) => r.id === selectedId);

  const goNext = useCallback(() => {
    if (currentIndex < sorted.length - 1) {
      setSelectedId(sorted[currentIndex + 1].id);
    }
  }, [currentIndex, sorted]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedId(sorted[currentIndex - 1].id);
    }
  }, [currentIndex, sorted]);

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) goPrev();
    else goNext();
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";

  if (rounds.length === 0) {
    return <p className="text-gray-400">No rounds yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Detail panel */}
      <div
        className="order-1 lg:order-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {selected ? (
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex <= 0}
                className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 dark:hover:text-gray-200"
                aria-label="Previous round"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {sorted.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex >= sorted.length - 1}
                className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 dark:hover:text-gray-200"
                aria-label="Next round"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="font-semibold">{selected.course_name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selected.date_played + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {selected.transport === "cart" ? "Cart" : "Walk"}
                  {selected.tee && ` · ${selected.tee.tee_name}`}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-3xl font-bold ${
                    selected.score < 80 ? "text-green-600" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {selected.score}
                </div>
                {(selected.front_nine != null || selected.back_nine != null) && (
                  <div className="text-xs text-gray-400">
                    {selected.front_nine ?? "—"} / {selected.back_nine ?? "—"}
                  </div>
                )}
                {vsParDisplay(selected) && (
                  <div className={`text-sm font-medium ${vsParColor(selected)}`}>
                    {vsParDisplay(selected)}
                  </div>
                )}
              </div>
            </div>

            {(selected.birdies != null || selected.pars != null || selected.gir != null || selected.fairways_hit != null || selected.total_putts != null || selected.penalties != null) && (
              <div className="mb-3 flex flex-wrap justify-center gap-3 rounded bg-gray-50 p-2 text-center text-xs dark:bg-gray-700">
                {selected.birdies != null && (
                  <div>
                    <div className="font-semibold">{selected.birdies}</div>
                    <div className="text-gray-500 dark:text-gray-400">Birdies</div>
                  </div>
                )}
                {selected.pars != null && (
                  <div>
                    <div className="font-semibold">{selected.pars}</div>
                    <div className="text-gray-500 dark:text-gray-400">Pars</div>
                  </div>
                )}
                {selected.gir != null && (
                  <div>
                    <div className="font-semibold">{selected.gir}</div>
                    <div className="text-gray-500 dark:text-gray-400">GIR</div>
                  </div>
                )}
                {selected.fairways_hit != null && (
                  <div>
                    <div className="font-semibold">{selected.fairways_hit}</div>
                    <div className="text-gray-500 dark:text-gray-400">Fairways</div>
                  </div>
                )}
                {selected.total_putts != null && (
                  <div>
                    <div className="font-semibold">{selected.total_putts}</div>
                    <div className="text-gray-500 dark:text-gray-400">Putts</div>
                  </div>
                )}
                {selected.penalties != null && (
                  <div>
                    <div className="font-semibold">{selected.penalties}</div>
                    <div className="text-gray-500 dark:text-gray-400">Penalties</div>
                  </div>
                )}
              </div>
            )}

            {selected.notes && (
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{selected.notes}</p>
            )}

            {selected.image_url && (
              <img
                src={selected.image_url}
                alt={`Scorecard from ${selected.course_name}`}
                className="mb-3 w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}

            {user && (
              <Link
                href={`/rounds/${selected.id}/edit`}
                className="block rounded-lg border border-green-600 px-3 py-1.5 text-center text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
              >
                Edit Round
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
            Select a round
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <th
                className="cursor-pointer px-3 py-2 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort("date")}
              >
                Date{sortArrow("date")}
              </th>
              <th
                className="cursor-pointer px-3 py-2 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort("course")}
              >
                Course{sortArrow("course")}
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort("score")}
              >
                Score{sortArrow("score")}
              </th>
              <th className="px-3 py-2 text-right">vs 79</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20 ${
                  selectedId === r.id ? "bg-green-50 dark:bg-green-900/20" : ""
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">
                  {formatDate(r.date_played)}
                </td>
                <td className="max-w-[120px] truncate px-3 py-2 font-medium" title={r.course_name}>
                  {r.course_name}
                </td>
                <td
                  className={`px-3 py-2 text-right font-bold ${
                    r.score < 80 ? "text-green-600" : ""
                  }`}
                >
                  {r.score}
                </td>
                <td
                  className={`px-3 py-2 text-right text-xs font-medium ${
                    r.score < 80 ? "text-green-600" : r.score === 80 ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {r.score < 80 ? `${r.score - 79}` : `+${r.score - 79}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
